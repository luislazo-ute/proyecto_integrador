import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, In } from 'typeorm';
import { RutaEntrega } from './entities/ruta-entrega.entity';
import { DetalleRuta } from './entities/detalle-ruta.entity';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { AddDetalleRutaDto } from './dto/add-detalle-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { ImportMovimientoDto } from './dto/import-movimiento.dto';
import { Producto } from '../producto/entities/producto.entity';
import { Transporte } from '../transporte/entities/transporte.entity';
import { Conductor } from '../conductor/entities/conductor.entity';
import { UsuarioService } from '../usuario/usuario.service';
import { MovimientoInventario } from '../movimiento-inventario/entities/movimiento-inventario.entity';
import { Kardex } from '../kardex/entities/kardex.entity';
import { Movimiento } from '../movimiento-inventario/entities/movimiento.entity';
import { MovimientoDetalle } from '../movimiento-inventario/entities/movimiento-detalle.entity';
import { MovimientoSeq } from '../movimiento-inventario/entities/movimiento_seq.entity';
@Injectable()
export class RutaEntregaService {
    constructor(
    @InjectRepository(RutaEntrega)
    private rutaRepo: Repository<RutaEntrega>, 
    @InjectRepository(DetalleRuta)
    private detalleRepo: Repository<DetalleRuta>, 
    @InjectRepository(Producto)
    private productoRepo: Repository<Producto>, 
    @InjectRepository(Transporte)
    private transporteRepo: Repository<Transporte>, 
    @InjectRepository(Conductor)
    private conductorRepo: Repository<Conductor>, private readonly usuarioService: UsuarioService, private readonly connection: Connection) { }
    private async assertConductorExists(id_conductor: string) {
        const conductor = await this.conductorRepo.findOne({
            where: { id_conductor },
        });
        if (!conductor)
            throw new NotFoundException('Conductor no encontrado');
        if (conductor.estado === false)
            throw new BadRequestException('El conductor está inactivo');
    }
    private mapRuta(ruta: RutaEntrega) {
        return {
            ...ruta,
            nombre_ruta: ruta.origen,
            fecha_programada: ruta.fecha_salida,
        };
    }
    async create(dto: CreateRutaDto) {
        const fechaSalida = dto.fecha_salida ?? dto.fecha_programada;
        const origen = dto.origen ?? dto.nombre_ruta ?? 'Ruta';
        const destino = dto.destino ?? 'Pendiente';
        if (dto.id_conductor) {
            await this.assertConductorExists(dto.id_conductor);
        }
        const ent = this.rutaRepo.create({
            origen,
            destino,
            peso_total_carga: 0,
            estado: 'en proceso',
            fecha_salida: fechaSalida ? new Date(fechaSalida) : null,
            fecha_llegada: dto.fecha_llegada ? new Date(dto.fecha_llegada) : null,
            id_transporte: dto.id_transporte ?? null,
            id_conductor: dto.id_conductor ?? null,
            id_usuario_encargado: dto.id_usuario_encargado ?? null,
            id_bodega: dto.id_bodega ?? null,
        });
        const saved = await this.rutaRepo.save(ent);
        return this.mapRuta(saved);
    }
    async update(id_ruta: string, dto: UpdateRutaDto) {
        const ruta = await this.rutaRepo.findOne({ where: { id_ruta } });
        if (!ruta)
            throw new NotFoundException('Ruta no encontrada');
        if (ruta.estado !== 'en proceso') {
            throw new BadRequestException('Solo se puede modificar una ruta cuando está en "en proceso".');
        }
        if (dto.id_transporte !== undefined &&
            dto.id_transporte !== ruta.id_transporte) {
            const nuevoTransporte = await this.transporteRepo.findOne({
                where: { id_transporte: dto.id_transporte },
            });
            if (!nuevoTransporte)
                throw new NotFoundException('Transporte no encontrado');
            if (nuevoTransporte.estado !== 'disponible') {
                throw new BadRequestException('El transporte seleccionado no está disponible');
            }
            if (ruta.id_transporte) {
                const transporteAnterior = await this.transporteRepo.findOne({
                    where: { id_transporte: ruta.id_transporte },
                });
                if (transporteAnterior && transporteAnterior.estado !== 'en ruta') {
                    transporteAnterior.estado = 'disponible';
                    await this.transporteRepo.save(transporteAnterior);
                }
            }
            ruta.id_transporte = dto.id_transporte;
        }
        if (dto.id_conductor !== undefined) {
            if (dto.id_conductor) {
                await this.assertConductorExists(dto.id_conductor);
            }
            ruta.id_conductor = dto.id_conductor;
        }
        if (dto.origen !== undefined)
            ruta.origen = dto.origen;
        if (dto.destino !== undefined)
            ruta.destino = dto.destino;
        if (dto.fecha_salida !== undefined)
            ruta.fecha_salida = dto.fecha_salida ? new Date(dto.fecha_salida) : null;
        if (dto.fecha_llegada !== undefined)
            ruta.fecha_llegada = dto.fecha_llegada
                ? new Date(dto.fecha_llegada)
                : null;
        const saved = await this.rutaRepo.save(ruta);
        return this.mapRuta(saved);
    }
    async cancelRoute(id_ruta: string) {
        const ruta = await this.rutaRepo.findOne({ where: { id_ruta } });
        if (!ruta)
            throw new NotFoundException('Ruta no encontrada');
        if (ruta.estado === 'completada') {
            throw new BadRequestException('No se puede cancelar una ruta completada');
        }
        if (ruta.estado === 'cancelada') {
            return { mensaje: 'La ruta ya está cancelada.' };
        }
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            ruta.estado = 'cancelada';
            ruta.fecha_llegada = ruta.fecha_llegada ?? new Date();
            await queryRunner.manager.save(ruta);
            if (ruta.id_transporte) {
                const transporte = await queryRunner.manager.findOne(Transporte, {
                    where: { id_transporte: ruta.id_transporte },
                });
                if (transporte) {
                    transporte.estado = 'disponible';
                    await queryRunner.manager.save(transporte);
                }
            }
            await queryRunner.commitTransaction();
            return { mensaje: 'Ruta cancelada y transporte liberado.' };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async addDetalle(dto: AddDetalleRutaDto) {
        const ruta = await this.rutaRepo.findOne({
            where: { id_ruta: dto.id_ruta },
        });
        if (!ruta)
            throw new NotFoundException('Ruta no encontrada');
        if (dto.direccion_entrega || dto.destinatario || dto.telefono) {
            const detalleEntrega = this.detalleRepo.create({
                id_ruta: dto.id_ruta,
                id_bodega_origen: dto.id_bodega_origen ?? null,
                id_bodega_destino: dto.id_bodega_destino ?? null,
                id_producto: dto.id_producto ?? null,
                cantidad: dto.cantidad ?? null,
                peso_total: 0,
                direccion_entrega: dto.direccion_entrega ?? null,
                destinatario: dto.destinatario ?? null,
                telefono: dto.telefono ?? null,
                estado: 'pendiente',
            });
            return this.detalleRepo.save(detalleEntrega);
        }
        if (!dto.id_producto || !dto.id_bodega_origen || !dto.id_bodega_destino) {
            throw new BadRequestException('Debe enviar id_producto, id_bodega_origen e id_bodega_destino (o completar los datos de entrega).');
        }
        if (!dto.cantidad || Number.isNaN(Number(dto.cantidad))) {
            throw new BadRequestException('Cantidad inválida');
        }
        const producto = await this.productoRepo.findOne({
            where: { id_producto: dto.id_producto },
        });
        if (!producto)
            throw new NotFoundException('Producto no encontrado');
        if (producto.peso === null || producto.peso === undefined) {
            throw new BadRequestException('El producto no tiene definido un peso para calcular carga.');
        }
        const pesoTotal = Number(producto.peso) * Number(dto.cantidad);
        const detalle = this.detalleRepo.create({
            id_ruta: dto.id_ruta,
            id_bodega_origen: dto.id_bodega_origen,
            id_bodega_destino: dto.id_bodega_destino,
            id_producto: dto.id_producto,
            cantidad: dto.cantidad,
            peso_total: pesoTotal,
            direccion_entrega: null,
            destinatario: null,
            telefono: null,
            estado: 'pendiente',
        });
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const savedDetalle = await queryRunner.manager.save(detalle);
            const rutaManaged = await queryRunner.manager.findOne(RutaEntrega, {
                where: { id_ruta: dto.id_ruta },
            });
            if (!rutaManaged) {
                throw new NotFoundException('La ruta no existe en la transacción.');
            }
            rutaManaged.peso_total_carga =
                Number(rutaManaged.peso_total_carga) + Number(pesoTotal);
            await queryRunner.manager.save(rutaManaged);
            await queryRunner.commitTransaction();
            return savedDetalle;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async importMovimiento(id_ruta: string, dto: ImportMovimientoDto) {
        const ruta = await this.rutaRepo.findOne({ where: { id_ruta } });
        if (!ruta)
            throw new NotFoundException('Ruta no encontrada');
        if (ruta.estado !== 'en proceso') {
            throw new BadRequestException('Solo se puede importar un movimiento cuando la ruta está en "en proceso".');
        }
        const movRepo = this.connection.getRepository(Movimiento);
        const mov = await movRepo.findOne({ where: { id_movimiento: dto.id_movimiento } });
        if (!mov)
            throw new NotFoundException('Movimiento no encontrado');
        if (ruta.id_bodega && mov.id_bodega_origen && ruta.id_bodega !== mov.id_bodega_origen) {
            throw new BadRequestException('El movimiento no corresponde a la bodega de la ruta (bodega origen distinta).');
        }
        const items = (mov.detalles ?? []).filter((d: any) => d?.id_producto && Number(d?.cantidad) > 0);
        if (!items.length) {
            throw new BadRequestException('El movimiento no tiene detalles con productos/cantidades');
        }
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let totalAdded = 0;
            for (const it of items) {
                const producto = it.producto
                    ? it.producto
                    : await queryRunner.manager.findOne(Producto, {
                        where: { id_producto: String(it.id_producto) },
                    });
                if (!producto)
                    throw new NotFoundException('Producto no encontrado');
                if (producto.peso === null || producto.peso === undefined) {
                    throw new BadRequestException(`El producto ${String((producto as any)?.nombre ?? producto.id_producto)} no tiene peso definido`);
                }
                const cantidad = Number(it.cantidad);
                const pesoTotal = Number(producto.peso) * cantidad;
                const detalle = queryRunner.manager.create(DetalleRuta, {
                    id_ruta,
                    id_bodega_origen: mov.id_bodega_origen,
                    id_bodega_destino: mov.id_bodega_destino,
                    id_producto: String(it.id_producto),
                    cantidad,
                    peso_total: pesoTotal,
                    direccion_entrega: null,
                    destinatario: null,
                    telefono: null,
                    estado: 'pendiente',
                });
                await queryRunner.manager.save(detalle);
                totalAdded += pesoTotal;
            }
            const rutaManaged = await queryRunner.manager.findOne(RutaEntrega, {
                where: { id_ruta },
            });
            if (!rutaManaged)
                throw new NotFoundException('Ruta no encontrada en transacción');
            rutaManaged.peso_total_carga = Number(rutaManaged.peso_total_carga) + Number(totalAdded);
            await queryRunner.manager.save(rutaManaged);
            await queryRunner.commitTransaction();
            return this.findOne(id_ruta);
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async confirmRoute(id_ruta: string, actorUserId?: string) {
        const ruta = await this.rutaRepo.findOne({ where: { id_ruta } });
        if (!ruta)
            throw new NotFoundException('Ruta no encontrada');
        if (!ruta.id_usuario_encargado && actorUserId) {
            ruta.id_usuario_encargado = String(actorUserId);
            await this.rutaRepo.save(ruta);
        }
        if (!ruta.id_transporte)
            throw new BadRequestException('Ruta sin transporte asignado');
        if (!ruta.id_conductor)
            throw new BadRequestException('Ruta sin conductor asignado');
        const transporte = await this.transporteRepo.findOne({
            where: { id_transporte: ruta.id_transporte },
        });
        if (!transporte)
            throw new NotFoundException('Transporte no encontrado');
        const capacidad = Number(transporte.capacidad);
        const pesoRuta = Number(ruta.peso_total_carga);
        if (pesoRuta > capacidad) {
            throw new BadRequestException(`Capacidad insuficiente. Peso total de la ruta: ${pesoRuta} kg. Capacidad del transporte: ${capacidad} kg.`);
        }
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            ruta.estado = 'en ruta';
            if (!ruta.fecha_salida)
                ruta.fecha_salida = new Date();
            await queryRunner.manager.save(ruta);
            transporte.estado = 'en ruta';
            await queryRunner.manager.save(transporte);
            await queryRunner.commitTransaction();
            return { mensaje: 'Ruta confirmada. Transporte cambiado a "en ruta".' };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async finalizeRoute(id_ruta: string, actorUserId?: string) {
        const ruta = await this.rutaRepo.findOne({ where: { id_ruta } });
        if (!ruta)
            throw new NotFoundException('Ruta no encontrada');
        if (ruta.estado === 'cancelada') {
            throw new BadRequestException('No se puede finalizar una ruta cancelada');
        }
        if (ruta.estado === 'completada') {
            return { mensaje: 'La ruta ya está completada.' };
        }
        if (!ruta.id_usuario_encargado && actorUserId) {
            ruta.id_usuario_encargado = String(actorUserId);
            await this.rutaRepo.save(ruta);
        }
        if (!ruta.id_usuario_encargado) {
            throw new BadRequestException('La ruta no tiene usuario encargado. Asigna id_usuario_encargado antes de finalizar (o inicia sesión para autocompletarlo).');
        }
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const detalles = await queryRunner.manager.find(DetalleRuta, {
                where: { id_ruta },
            });
            const usuarioId = ruta.id_usuario_encargado as string;
            const nextCodigo = async () => {
                let seq = await queryRunner.manager.findOne(MovimientoSeq, {
                    where: {},
                    lock: { mode: 'pessimistic_write' },
                });
                if (!seq) {
                    const created = queryRunner.manager.create(MovimientoSeq, { last_seq: 0 });
                    await queryRunner.manager.save(created);
                    seq = await queryRunner.manager.findOne(MovimientoSeq, {
                        where: { id: created.id },
                        lock: { mode: 'pessimistic_write' },
                    });
                }
                if (!seq)
                    throw new Error('No se pudo inicializar el secuencial de movimientos');
                seq.last_seq += 1;
                await queryRunner.manager.save(seq);
                return `MOV-${String(seq.last_seq).padStart(6, '0')}`;
            };
            const itemsByBodega = new Map<string, Array<{
                id_producto: string;
                cantidad: number;
            }>>();
            for (const d of detalles) {
                if (!d.id_producto || !d.cantidad || !d.id_bodega_origen)
                    continue;
                const idBodega = String(d.id_bodega_origen);
                const arr = itemsByBodega.get(idBodega) ?? [];
                arr.push({ id_producto: String(d.id_producto), cantidad: Number(d.cantidad) });
                itemsByBodega.set(idBodega, arr);
            }
            for (const [idBodega, items] of itemsByBodega.entries()) {
                const merged = new Map<string, number>();
                for (const it of items) {
                    merged.set(it.id_producto, (merged.get(it.id_producto) ?? 0) + Number(it.cantidad || 0));
                }
                const mergedItems = [...merged.entries()].map(([id_producto, cantidad]) => ({ id_producto, cantidad }));
                const codigo = await nextCodigo();
                const mov = queryRunner.manager.create(Movimiento, {
                    codigo,
                    id_bodega_origen: idBodega,
                    id_bodega_destino: idBodega,
                    id_usuario: usuarioId,
                    fecha_movimiento: new Date(),
                    observacion: `Salida por finalización de ruta ${id_ruta}`,
                    detalles: mergedItems.map((it) => queryRunner.manager.create(MovimientoDetalle, {
                        id_producto: it.id_producto,
                        cantidad: it.cantidad,
                    })),
                });
                const movGuardado = await queryRunner.manager.save(mov);
                for (const it of mergedItems) {
                    const idProducto = it.id_producto;
                    const cantidad = it.cantidad;
                    const producto = await queryRunner.manager.findOne(Producto, {
                        where: { id_producto: idProducto },
                    });
                    if (!producto)
                        throw new NotFoundException('Producto no encontrado');
                    if (producto.stock_actual < cantidad) {
                        throw new BadRequestException('Stock insuficiente para finalizar la ruta');
                    }
                    producto.stock_actual = producto.stock_actual - cantidad;
                    await queryRunner.manager.save(producto);
                    const kardex = queryRunner.manager.create(Kardex, {
                        id_producto: idProducto,
                        id_bodega: idBodega,
                        id_usuario: usuarioId,
                        fecha: new Date(),
                        tipo: 'salida',
                        cantidad,
                        saldo: producto.stock_actual,
                        descripcion: `Salida por ruta ${id_ruta}`,
                        id_movimiento: movGuardado.id_movimiento,
                    });
                    await queryRunner.manager.save(kardex);
                }
            }
            ruta.estado = 'completada';
            ruta.fecha_llegada = new Date();
            await queryRunner.manager.save(ruta);
            if (ruta.id_transporte) {
                const transporte = await queryRunner.manager.findOne(Transporte, {
                    where: { id_transporte: ruta.id_transporte },
                });
                if (transporte) {
                    transporte.estado = 'disponible';
                    await queryRunner.manager.save(transporte);
                }
            }
            await queryRunner.commitTransaction();
            return {
                mensaje: 'Ruta finalizada, stock descontado y transporte liberado.',
            };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll() {
        const rows = await this.rutaRepo.find({ relations: ['detalles'] });
        const conductorIds = Array.from(new Set(rows.map((r) => r.id_conductor).filter(Boolean))) as string[];
        const conductores = conductorIds.length
            ? await this.conductorRepo.find({
                where: { id_conductor: In(conductorIds) },
            })
            : [];
        const byId = new Map(conductores.map((c) => [c.id_conductor, c]));
        const encargadoIds = Array.from(new Set(rows.map((r) => r.id_usuario_encargado).filter(Boolean))) as string[];
        const encargadosLite = encargadoIds.length
            ? await this.usuarioService.findManyLiteByIds(encargadoIds)
            : [];
        const encargadosById = new Map((encargadosLite ?? []).map((u: any) => [String(u?._id ?? '').trim(), u]));
        return rows.map((r) => {
            const conductor = r.id_conductor ? byId.get(r.id_conductor) : null;
            const encargado = r.id_usuario_encargado
                ? encargadosById.get(String(r.id_usuario_encargado).trim())
                : null;
            return {
                ...this.mapRuta(r),
                conductor: conductor
                    ? {
                        id_conductor: conductor.id_conductor,
                        numero: conductor.numero,
                        nombre: conductor.nombre,
                        telefono: conductor.telefono,
                        estado: conductor.estado,
                    }
                    : null,
                encargado: encargado
                    ? {
                        _id: String((encargado as any)?._id ?? ''),
                        nombre: (encargado as any)?.nombre ?? null,
                        username: (encargado as any)?.username ?? null,
                    }
                    : null,
            };
        });
    }
    async findOne(id: string) {
        const r = await this.rutaRepo.findOne({
            where: { id_ruta: id },
            relations: ['detalles'],
        });
        if (!r)
            return r;
        const conductor = r.id_conductor
            ? await this.conductorRepo.findOne({ where: { id_conductor: r.id_conductor } })
            : null;
        const encargado = r.id_usuario_encargado
            ? (await this.usuarioService.findManyLiteByIds([
                String(r.id_usuario_encargado).trim(),
            ]))?.[0]
            : null;
        return {
            ...this.mapRuta(r),
            conductor: conductor
                ? {
                    id_conductor: conductor.id_conductor,
                    numero: conductor.numero,
                    nombre: conductor.nombre,
                    telefono: conductor.telefono,
                    estado: conductor.estado,
                }
                : null,
            encargado: encargado
                ? {
                    _id: String((encargado as any)?._id ?? ''),
                    nombre: (encargado as any)?.nombre ?? null,
                    username: (encargado as any)?.username ?? null,
                }
                : null,
        };
    }
}
