import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { GuiaRemision } from './entities/guia-remision.entity';
import { DetalleGuiaRemision } from './entities/detalle-guia.entity';
import { CreateGuiaDto } from './dto/create-guia.dto';
import { AddDetalleGuiaDto } from './dto/add-detalle-guia.dto';
import { FilterGuiaDto } from './dto/filter-guia.dto';
import { Producto } from 'src/modules/producto/entities/producto.entity';
import { RutaEntrega } from 'src/modules/ruta-entrega/entities/ruta-entrega.entity';
import { Transporte } from 'src/modules/transporte/entities/transporte.entity';
import { Conductor } from 'src/modules/conductor/entities/conductor.entity';
@Injectable()
export class GuiaRemisionService {
    constructor(
    @InjectRepository(GuiaRemision)
    private guiaRepo: Repository<GuiaRemision>, 
    @InjectRepository(DetalleGuiaRemision)
    private detalleRepo: Repository<DetalleGuiaRemision>, 
    @InjectRepository(Producto)
    private productoRepo: Repository<Producto>, 
    @InjectRepository(RutaEntrega)
    private rutaRepo: Repository<RutaEntrega>, 
    @InjectRepository(Transporte)
    private transporteRepo: Repository<Transporte>, 
    @InjectRepository(Conductor)
    private conductorRepo: Repository<Conductor>, private readonly connection: Connection) { }
    private async generateNumeroGuia(): Promise<string> {
        const pad2 = (n: number) => n.toString().padStart(2, '0');
        const now = new Date();
        const stamp = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;
        for (let attempt = 0; attempt < 5; attempt++) {
            const rand = Math.floor(Math.random() * 1000000)
                .toString()
                .padStart(6, '0');
            const numero = `GR-${stamp}-${rand}`;
            const exists = await this.guiaRepo.exist({
                where: { numero_guia: numero },
            });
            if (!exists)
                return numero;
        }
        throw new BadRequestException('No se pudo generar un número de guía único');
    }
    async create(dto: CreateGuiaDto) {
        const ruta = await this.rutaRepo.findOne({
            where: { id_ruta: dto.id_ruta },
            relations: ['detalles'],
        });
        if (!ruta)
            throw new NotFoundException('Ruta no encontrada');
        const transporte = await this.transporteRepo.findOne({
            where: { id_transporte: dto.id_transporte },
        });
        if (!transporte)
            throw new NotFoundException('Transporte no encontrado');
        const conductor = await this.conductorRepo.findOne({
            where: { id_conductor: dto.id_conductor },
        });
        if (!conductor)
            throw new NotFoundException('Conductor no encontrado');
        const detallesRuta = (ruta.detalles ?? []).filter((d: any) => d?.id_producto && d?.cantidad);
        const pesoRuta = Math.round(detallesRuta
            .reduce((acc: number, d: any) => acc + Number(d?.peso_total ?? 0), 0)
            * 100) / 100;
        const capacidad = Number(transporte.capacidad);
        if (pesoRuta > capacidad) {
            throw new BadRequestException(`Capacidad insuficiente. Peso de la ruta: ${pesoRuta} kg. Capacidad del transporte: ${capacidad} kg.`);
        }
        const numero_guia = dto.numero_guia?.trim()
            ? dto.numero_guia.trim()
            : await this.generateNumeroGuia();
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const guia = queryRunner.manager.create(GuiaRemision, {
                ...dto,
                numero_guia,
                ruta,
                fecha_emision: new Date(),
                estado: 'emitida',
                peso_total: pesoRuta,
            });
            const savedGuia = await queryRunner.manager.save(guia);
            if (detallesRuta.length) {
                const detallesGuia = detallesRuta.map((d: any) => queryRunner.manager.create(DetalleGuiaRemision, {
                    id_guia: savedGuia.id_guia,
                    id_producto: String(d.id_producto),
                    cantidad: Number(d.cantidad),
                    peso_total: Number(d.peso_total ?? 0),
                    observacion: null,
                }));
                await queryRunner.manager.save(detallesGuia);
            }
            await queryRunner.commitTransaction();
            return savedGuia;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async addDetalle(dto: AddDetalleGuiaDto) {
        const guia = await this.guiaRepo.findOne({
            where: { id_guia: dto.id_guia },
        });
        if (!guia) {
            throw new NotFoundException('Guía no encontrada');
        }
        if (guia.estado !== 'emitida') {
            throw new BadRequestException('No se pueden agregar productos a una guía que no esté emitida');
        }
        const producto = await this.productoRepo.findOne({
            where: { id_producto: dto.id_producto },
        });
        if (!producto) {
            throw new NotFoundException('Producto no encontrado');
        }
        const transporte = await this.transporteRepo.findOne({
            where: { id_transporte: guia.id_transporte },
        });
        if (!transporte) {
            throw new NotFoundException('Transporte no encontrado');
        }
        const pesoDetalle = Number(producto.peso) * Number(dto.cantidad);
        const nuevoPesoTotal = Number(guia.peso_total) + pesoDetalle;
        if (nuevoPesoTotal > Number(transporte.capacidad)) {
            throw new BadRequestException(`No se puede agregar el producto. 
       Peso actual: ${guia.peso_total} kg, 
       nuevo peso: ${nuevoPesoTotal} kg, 
       capacidad máxima: ${transporte.capacidad} kg`);
        }
        const detalle = this.detalleRepo.create({
            ...dto,
            peso_total: pesoDetalle,
        });
        await this.detalleRepo.save(detalle);
        guia.peso_total = nuevoPesoTotal;
        await this.guiaRepo.save(guia);
        return {
            message: 'Detalle agregado correctamente',
            detalle,
            peso_total_guia: guia.peso_total,
        };
    }
    async enviar(id: string) {
        const guia = await this.guiaRepo.findOne({ where: { id_guia: id } });
        if (!guia) {
            throw new NotFoundException('Guía no encontrada');
        }
        if (guia.estado !== 'emitida') {
            throw new BadRequestException('La guía no se puede enviar en su estado actual');
        }
        const transporte = await this.transporteRepo.findOne({
            where: { id_transporte: guia.id_transporte },
        });
        if (!transporte) {
            throw new NotFoundException('Transporte no encontrado');
        }
        if (Number(guia.peso_total) > Number(transporte.capacidad)) {
            throw new BadRequestException(`El peso total de la guía (${guia.peso_total} kg) excede la capacidad del transporte (${transporte.capacidad} kg)`);
        }
        transporte.estado = 'en ruta';
        await this.transporteRepo.save(transporte);
        guia.estado = 'en transito';
        guia.fecha_inicio_transporte = new Date();
        return this.guiaRepo.save(guia);
    }
    async finalizar(id: string) {
        const guia = await this.guiaRepo.findOne({ where: { id_guia: id } });
        if (!guia)
            throw new NotFoundException('Guía no encontrada');
        const transporte = await this.transporteRepo.findOne({
            where: { id_transporte: guia.id_transporte },
        });
        if (!transporte) {
            throw new NotFoundException('Transporte no encontrado.');
        }
        transporte.estado = 'disponible';
        await this.transporteRepo.save(transporte);
        guia.estado = 'finalizada';
        guia.fecha_fin_transporte = new Date();
        return this.guiaRepo.save(guia);
    }
    findAll(filter?: FilterGuiaDto) {
        const qb = this.guiaRepo
            .createQueryBuilder('g')
            .leftJoinAndSelect('g.detalles', 'd')
            .leftJoinAndSelect('d.producto', 'p')
            .orderBy('g.fecha_emision', 'DESC');
        const numero = filter?.numero?.trim();
        if (numero) {
            qb.andWhere('LOWER(g.numero_guia) LIKE :numero', { numero: `%${numero.toLowerCase()}%` });
        }
        if (filter?.estado) {
            qb.andWhere('g.estado = :estado', { estado: filter.estado });
        }
        if (filter?.fecha_inicio) {
            qb.andWhere('g.fecha_emision >= :fecha_inicio', { fecha_inicio: new Date(filter.fecha_inicio) });
        }
        if (filter?.fecha_fin) {
            qb.andWhere('g.fecha_emision <= :fecha_fin', { fecha_fin: new Date(filter.fecha_fin) });
        }
        return qb.getMany();
    }
    findOne(id: string) {
        return this.guiaRepo.findOne({
            where: { id_guia: id },
            relations: ['detalles', 'detalles.producto'],
        });
    }
}
