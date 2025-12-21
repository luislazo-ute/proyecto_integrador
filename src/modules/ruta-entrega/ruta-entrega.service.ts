// src/modules/ruta-entrega/ruta-entrega.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { RutaEntrega } from './entities/ruta-entrega.entity';
import { DetalleRuta } from './entities/detalle-ruta.entity';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { AddDetalleRutaDto } from './dto/add-detalle-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { Producto } from '../producto/entities/producto.entity';
import { Transporte } from '../transporte/entities/transporte.entity';
import { MovimientoInventario } from '../movimiento-inventario/entities/movimiento-inventario.entity';
import { Kardex } from '../kardex/entities/kardex.entity';

@Injectable()
export class RutaEntregaService {
  constructor(
    @InjectRepository(RutaEntrega) private rutaRepo: Repository<RutaEntrega>,
    @InjectRepository(DetalleRuta) private detalleRepo: Repository<DetalleRuta>,
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    @InjectRepository(Transporte)
    private transporteRepo: Repository<Transporte>,
    private readonly connection: Connection,
  ) {}

  async create(dto: CreateRutaDto) {
    const ent = this.rutaRepo.create({
      ...dto,
      peso_total_carga: 0,
      estado:
        dto.id_transporte && dto.id_conductor ? 'en proceso' : 'en proceso',
      fecha_salida: dto.fecha_salida ? new Date(dto.fecha_salida) : null,
      fecha_llegada: dto.fecha_llegada ? new Date(dto.fecha_llegada) : null,
    });
    return this.rutaRepo.save(ent);
  }

  async update(id_ruta: string, dto: UpdateRutaDto) {
    const ruta = await this.rutaRepo.findOne({ where: { id_ruta } });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');

    if (ruta.estado !== 'en proceso') {
      throw new BadRequestException(
        'Solo se puede modificar una ruta cuando está en "en proceso".',
      );
    }

    if (
      dto.id_transporte !== undefined &&
      dto.id_transporte !== ruta.id_transporte
    ) {
      const nuevoTransporte = await this.transporteRepo.findOne({
        where: { id_transporte: dto.id_transporte },
      });
      if (!nuevoTransporte)
        throw new NotFoundException('Transporte no encontrado');

      if (nuevoTransporte.estado !== 'disponible') {
        throw new BadRequestException(
          'El transporte seleccionado no está disponible',
        );
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
      ruta.id_conductor = dto.id_conductor;
    }

    if (dto.origen !== undefined) ruta.origen = dto.origen;
    if (dto.destino !== undefined) ruta.destino = dto.destino;
    if (dto.fecha_salida !== undefined)
      ruta.fecha_salida = dto.fecha_salida ? new Date(dto.fecha_salida) : null;
    if (dto.fecha_llegada !== undefined)
      ruta.fecha_llegada = dto.fecha_llegada
        ? new Date(dto.fecha_llegada)
        : null;

    return this.rutaRepo.save(ruta);
  }

  async cancelRoute(id_ruta: string) {
    const ruta = await this.rutaRepo.findOne({ where: { id_ruta } });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');

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
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async addDetalle(dto: AddDetalleRutaDto) {
    // Validaciones básicas
    const ruta = await this.rutaRepo.findOne({
      where: { id_ruta: dto.id_ruta },
    });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');

    const producto = await this.productoRepo.findOne({
      where: { id_producto: dto.id_producto },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    if (producto.peso === null || producto.peso === undefined) {
      throw new BadRequestException(
        'El producto no tiene definido un peso para calcular carga.',
      );
    }

    // calcular peso_total: cantidad * peso del producto
    const pesoTotal = Number(producto.peso) * Number(dto.cantidad);

    // crear detalle
    const detalle = this.detalleRepo.create({
      id_ruta: dto.id_ruta,
      id_bodega_origen: dto.id_bodega_origen,
      id_bodega_destino: dto.id_bodega_destino,
      id_producto: dto.id_producto,
      cantidad: dto.cantidad,
      peso_total: pesoTotal,
    });

    // transacción: guardar detalle y actualizar peso_total_carga en ruta
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const savedDetalle = await queryRunner.manager.save(detalle);

      // recargar ruta desde queryRunner por seguridad
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
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmRoute(id_ruta: string) {
    // Cargar ruta con transporte
    const ruta = await this.rutaRepo.findOne({ where: { id_ruta } });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');

    if (!ruta.id_transporte)
      throw new BadRequestException('Ruta sin transporte asignado');
    if (!ruta.id_conductor)
      throw new BadRequestException('Ruta sin conductor asignado');

    const transporte = await this.transporteRepo.findOne({
      where: { id_transporte: ruta.id_transporte },
    });
    if (!transporte) throw new NotFoundException('Transporte no encontrado');

    const capacidad = Number(transporte.capacidad);
    const pesoRuta = Number(ruta.peso_total_carga);

    if (pesoRuta > capacidad) {
      throw new BadRequestException(
        `Capacidad insuficiente. Peso total de la ruta: ${pesoRuta} kg. Capacidad del transporte: ${capacidad} kg.`,
      );
    }

    // transacción: actualizar estado de ruta y transporte
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // actualizar ruta
      ruta.estado = 'en ruta';
      if (!ruta.fecha_salida) ruta.fecha_salida = new Date();
      await queryRunner.manager.save(ruta);

      // actualizar transporte
      transporte.estado = 'en ruta';
      await queryRunner.manager.save(transporte);

      await queryRunner.commitTransaction();
      return { mensaje: 'Ruta confirmada. Transporte cambiado a "en ruta".' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async finalizeRoute(id_ruta: string) {
    const ruta = await this.rutaRepo.findOne({ where: { id_ruta } });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');

    if (ruta.estado === 'cancelada') {
      throw new BadRequestException('No se puede finalizar una ruta cancelada');
    }

    if (ruta.estado === 'completada') {
      return { mensaje: 'La ruta ya está completada.' };
    }

    if (!ruta.id_usuario_encargado) {
      throw new BadRequestException(
        'La ruta no tiene usuario encargado (id_usuario_encargado)',
      );
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const detalles = await queryRunner.manager.find(DetalleRuta, {
        where: { id_ruta },
      });

      for (const d of detalles) {
        const producto = await queryRunner.manager.findOne(Producto, {
          where: { id_producto: d.id_producto },
        });
        if (!producto) throw new NotFoundException('Producto no encontrado');

        if (producto.stock_actual < d.cantidad) {
          throw new BadRequestException(
            'Stock insuficiente para finalizar la ruta',
          );
        }

        producto.stock_actual = producto.stock_actual - d.cantidad;
        await queryRunner.manager.save(producto);

        const movimiento = queryRunner.manager.create(MovimientoInventario, {
          id_producto: d.id_producto,
          id_bodega: d.id_bodega_origen,
          tipo_movimiento: 'salida',
          cantidad: d.cantidad,
          fecha_movimiento: new Date(),
          observacion: `Salida por finalización de ruta ${id_ruta}`,
          id_usuario: ruta.id_usuario_encargado,
        });

        const movimientoGuardado = await queryRunner.manager.save(movimiento);

        const kardex = queryRunner.manager.create(Kardex, {
          id_producto: d.id_producto,
          fecha: new Date(),
          tipo: 'salida',
          cantidad: d.cantidad,
          saldo: producto.stock_actual,
          descripcion: `Salida por ruta ${id_ruta}`,
          id_movimiento: movimientoGuardado.id_movimiento,
        });

        await queryRunner.manager.save(kardex);
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
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return this.rutaRepo.find({ relations: ['detalles'] });
  }

  findOne(id: string) {
    return this.rutaRepo.findOne({
      where: { id_ruta: id },
      relations: ['detalles'],
    });
  }
}
