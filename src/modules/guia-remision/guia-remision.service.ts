import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { GuiaRemision } from './entities/guia-remision.entity';
import { DetalleGuiaRemision } from './entities/detalle-guia.entity';
import { CreateGuiaDto } from './dto/create-guia.dto';
import { AddDetalleGuiaDto } from './dto/add-detalle-guia.dto';
import { Producto } from 'src/modules/producto/entities/producto.entity';
import { RutaEntrega } from 'src/modules/ruta-entrega/entities/ruta-entrega.entity';
import { Transporte } from 'src/modules/transporte/entities/transporte.entity';

@Injectable()
export class GuiaRemisionService {
  constructor(
    @InjectRepository(GuiaRemision) private guiaRepo: Repository<GuiaRemision>,
    @InjectRepository(DetalleGuiaRemision) private detalleRepo: Repository<DetalleGuiaRemision>,
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    @InjectRepository(RutaEntrega) private rutaRepo: Repository<RutaEntrega>,
    @InjectRepository(Transporte) private transporteRepo: Repository<Transporte>,
    private readonly connection: Connection,
  ) {}

  async create(dto: CreateGuiaDto) {
    const ruta = await this.rutaRepo.findOne({ where: { id_ruta: dto.id_ruta } });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');

    const transporte = await this.transporteRepo.findOne({ where: { id_transporte: dto.id_transporte } });
    if (!transporte) throw new NotFoundException('Transporte no encontrado');

    const guia = this.guiaRepo.create({
      ...dto,
      fecha_emision: new Date(),
      estado: 'emitida',
      peso_total: 0
    });

    return this.guiaRepo.save(guia);
  }

  async addDetalle(dto: AddDetalleGuiaDto) {
    const guia = await this.guiaRepo.findOne({ where: { id_guia: dto.id_guia } });
    if (!guia) throw new NotFoundException('Guía de remisión no encontrada');

    const producto = await this.productoRepo.findOne({ where: { id_producto: dto.id_producto } });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    const pesoTotal = Number(producto.peso) * Number(dto.cantidad);

    const detalle = this.detalleRepo.create({
      id_guia: dto.id_guia,
      id_producto: dto.id_producto,
      cantidad: dto.cantidad,
      peso_total: pesoTotal,
      observacion: dto.observacion || null
    });

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(detalle);

      guia.peso_total = Number(guia.peso_total) + Number(pesoTotal);
      await queryRunner.manager.save(guia);

      await queryRunner.commitTransaction();
      return detalle;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async enviar(id: string) {
  const guia = await this.guiaRepo.findOne({ where: { id_guia: id } });
  if (!guia) throw new NotFoundException('Guía no encontrada');

  if (guia.estado !== 'emitida') {
    throw new BadRequestException('La guía ya está en tránsito o finalizada');
  }

  const transporte = await this.transporteRepo.findOne({
    where: { id_transporte: guia.id_transporte },
  });

  if (!transporte) {
    throw new NotFoundException('Transporte no encontrado para esta guía.');
  }

  // Cambiar estado del transporte
  transporte.estado = 'en ruta';
  await this.transporteRepo.save(transporte);

  // Actualizar guía
  guia.estado = 'en transito';
  guia.fecha_inicio_transporte = new Date();

  return this.guiaRepo.save(guia);
}


  async finalizar(id: string) {
  const guia = await this.guiaRepo.findOne({ where: { id_guia: id } });
  if (!guia) throw new NotFoundException('Guía no encontrada');

  const transporte = await this.transporteRepo.findOne({
    where: { id_transporte: guia.id_transporte },
  });

  if (!transporte) {
    throw new NotFoundException('Transporte no encontrado.');
  }

  // Cambiar estado del transporte
  transporte.estado = 'disponible';
  await this.transporteRepo.save(transporte);

  // Actualizar guía
  guia.estado = 'finalizada';
  guia.fecha_fin_transporte = new Date();

  return this.guiaRepo.save(guia);
}


  findAll() {
    return this.guiaRepo.find({ relations: ['detalles'] });
  }

  findOne(id: string) {
    return this.guiaRepo.findOne({ where: { id_guia: id }, relations: ['detalles'] });
  }
}
