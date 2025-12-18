import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GuiaRemision } from './entities/guia-remision.entity';
import { DetalleGuiaRemision } from './entities/detalle-guia.entity';
import { CreateGuiaDto } from './dto/create-guia.dto';
import { AddDetalleGuiaDto } from './dto/add-detalle-guia.dto';

import { Producto } from 'src/modules/producto/entities/producto.entity';
import { RutaEntrega } from 'src/modules/ruta-entrega/entities/ruta-entrega.entity';
import { Transporte } from 'src/modules/transporte/entities/transporte.entity';

import {
  GuiaRemisionMongo,
  GuiaRemisionDocument,
} from './schemas/guia-remision.schema';

@Injectable()
export class GuiaRemisionService {
  constructor(
    @InjectRepository(GuiaRemision) private guiaRepo: Repository<GuiaRemision>,
    @InjectRepository(DetalleGuiaRemision)
    private detalleRepo: Repository<DetalleGuiaRemision>,
    @InjectRepository(Producto)
    private productoRepo: Repository<Producto>,
    @InjectRepository(RutaEntrega)
    private rutaRepo: Repository<RutaEntrega>,
    @InjectRepository(Transporte)
    private transporteRepo: Repository<Transporte>,
    private readonly connection: Connection,

    // ===== MONGO =====
    @InjectModel(GuiaRemisionMongo.name)
    private guiaMongoModel: Model<GuiaRemisionDocument>,
  ) {}

  // ================= CREAR GUIA =================
  async create(dto: CreateGuiaDto) {
    const ruta = await this.rutaRepo.findOne({
      where: { id_ruta: dto.id_ruta },
    });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');

    const transporte = await this.transporteRepo.findOne({
      where: { id_transporte: dto.id_transporte },
    });
    if (!transporte) throw new NotFoundException('Transporte no encontrado');

    const guia = this.guiaRepo.create({
      ...dto,
      fecha_emision: new Date(),
      estado: 'emitida',
      peso_total: 0,
    });

    const saved = await this.guiaRepo.save(guia);

    // ===== GUARDAR EN MONGO =====
    await this.guiaMongoModel.create({
      id_guia: saved.id_guia,
      numero_guia: saved.numero_guia,
      fecha_emision: saved.fecha_emision,
      punto_partida: saved.punto_partida,
      punto_llegada: saved.punto_llegada,
      motivo_traslado: saved.motivo_traslado,
      id_ruta: saved.id_ruta,
      id_transporte: saved.id_transporte,
      id_conductor: saved.id_conductor,
      peso_total: 0,
      estado: 'emitida',
      detalles: [],
    });

    return saved;
  }

  // ================= DETALLE =================
  async addDetalle(dto: AddDetalleGuiaDto) {
    const guia = await this.guiaRepo.findOne({
      where: { id_guia: dto.id_guia },
    });
    if (!guia) throw new NotFoundException('Guía no encontrada');

    const producto = await this.productoRepo.findOne({
      where: { id_producto: dto.id_producto },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    const pesoTotal = Number(producto.peso) * Number(dto.cantidad);

    const detalle = this.detalleRepo.create({
      id_guia: dto.id_guia,
      id_producto: dto.id_producto,
      cantidad: dto.cantidad,
      peso_total: pesoTotal,
      observacion: dto.observacion || null,
    });

    const qr = this.connection.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      await qr.manager.save(detalle);

      guia.peso_total = Number(guia.peso_total) + pesoTotal;
      await qr.manager.save(guia);

      // ===== ACTUALIZAR MONGO =====
      await this.guiaMongoModel.updateOne(
        { id_guia: guia.id_guia },
        {
          $push: {
            detalles: {
              id_producto: dto.id_producto,
              cantidad: dto.cantidad,
              peso_total: pesoTotal,
              observacion: dto.observacion,
            },
          },
          $inc: { peso_total: pesoTotal },
        },
      );

      await qr.commitTransaction();
      return detalle;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  // ================= ESTADOS =================
  async enviar(id: string) {
    const guia = await this.guiaRepo.findOne({ where: { id_guia: id } });
    if (!guia) throw new NotFoundException('Guía no encontrada');

    if (guia.estado !== 'emitida') {
      throw new BadRequestException('La guía ya fue enviada');
    }

    guia.estado = 'en transito';
    guia.fecha_inicio_transporte = new Date();

    const saved = await this.guiaRepo.save(guia);

    await this.guiaMongoModel.updateOne(
      { id_guia: id },
      {
        estado: 'en transito',
        fecha_inicio_transporte: saved.fecha_inicio_transporte,
      },
    );

    return saved;
  }

  async finalizar(id: string) {
    const guia = await this.guiaRepo.findOne({ where: { id_guia: id } });
    if (!guia) throw new NotFoundException('Guía no encontrada');

    guia.estado = 'finalizada';
    guia.fecha_fin_transporte = new Date();

    const saved = await this.guiaRepo.save(guia);

    await this.guiaMongoModel.updateOne(
      { id_guia: id },
      {
        estado: 'finalizada',
        fecha_fin_transporte: saved.fecha_fin_transporte,
      },
    );

    return saved;
  }

  // ================= CONSULTAS =================
  findAll() {
    return this.guiaRepo.find({ relations: ['detalles'] });
  }

  findOne(id: string) {
    return this.guiaRepo.findOne({
      where: { id_guia: id },
      relations: ['detalles'],
    });
  }
}
