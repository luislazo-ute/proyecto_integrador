import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RutaEntrega } from './entities/ruta-entrega.entity';
import { DetalleRuta } from './entities/detalle-ruta.entity';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { AddDetalleRutaDto } from './dto/add-detalle-ruta.dto';
import { Producto } from '../producto/entities/producto.entity';
import { Transporte } from '../transporte/entities/transporte.entity';

import {
  RutaEntregaMongo,
  RutaEntregaDocument,
} from './schemas/ruta-entrega.schema';

@Injectable()
export class RutaEntregaService {
  constructor(
    @InjectRepository(RutaEntrega) private rutaRepo: Repository<RutaEntrega>,
    @InjectRepository(DetalleRuta) private detalleRepo: Repository<DetalleRuta>,
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    @InjectRepository(Transporte) private transporteRepo: Repository<Transporte>,
    private readonly connection: Connection,

    // Mongo
    @InjectModel(RutaEntregaMongo.name)
    private readonly rutaMongoModel: Model<RutaEntregaDocument>,
  ) {}

  async create(dto: CreateRutaDto) {
    const ruta = this.rutaRepo.create({
      ...dto,
      peso_total_carga: 0,
      estado: 'en proceso',
      fecha_salida: dto.fecha_salida ? new Date(dto.fecha_salida) : null,
      fecha_llegada: dto.fecha_llegada ? new Date(dto.fecha_llegada) : null,
    });

    const saved = await this.rutaRepo.save(ruta);

    await this.rutaMongoModel.create({
      id_ruta: saved.id_ruta,
      origen: saved.origen,
      destino: saved.destino,
      fecha_salida: saved.fecha_salida ?? undefined,
      fecha_llegada: saved.fecha_llegada ?? undefined,
      estado: saved.estado,
      peso_total_carga: saved.peso_total_carga,
      id_transporte: saved.id_transporte ?? undefined,
      id_conductor: saved.id_conductor ?? undefined,
    });

    return saved;
  }

  async addDetalle(dto: AddDetalleRutaDto) {
    const ruta = await this.rutaRepo.findOne({ where: { id_ruta: dto.id_ruta } });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');

    const producto = await this.productoRepo.findOne({
      where: { id_producto: dto.id_producto },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    const pesoTotal = Number(producto.peso) * Number(dto.cantidad);

    const detalle = this.detalleRepo.create({
      ...dto,
      peso_total: pesoTotal,
    });

    const qr = this.connection.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      await qr.manager.save(detalle);
      ruta.peso_total_carga += pesoTotal;
      await qr.manager.save(ruta);
      await qr.commitTransaction();
      return detalle;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  // ✅ MÉTODO QUE FALTABA
  async confirmRoute(id_ruta: string) {
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

    if (Number(ruta.peso_total_carga) > Number(transporte.capacidad)) {
      throw new BadRequestException('Capacidad del transporte insuficiente');
    }

    ruta.estado = 'en ruta';
    if (!ruta.fecha_salida) ruta.fecha_salida = new Date();

    await this.rutaRepo.save(ruta);

    return { mensaje: 'Ruta confirmada correctamente' };
  }

  // ✅ MÉTODO QUE FALTABA
  async finalizeRoute(id_ruta: string) {
    const ruta = await this.rutaRepo.findOne({ where: { id_ruta } });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');

    ruta.estado = 'completada';
    ruta.fecha_llegada = new Date();

    await this.rutaRepo.save(ruta);

    return { mensaje: 'Ruta finalizada correctamente' };
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
