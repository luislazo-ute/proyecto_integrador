import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { Producto } from '../producto/entities/producto.entity';
import { Bodega } from '../bodega/entities/bodega.entity';
import { Kardex } from '../kardex/entities/kardex.entity';

import { KardexService } from '../kardex/kardex.service';

import {
  MovimientoInventarioMongo,
  MovimientoInventarioDocument,
} from './schemas/movimiento-inventario.schema';

import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Injectable()
export class MovimientoInventarioService {
  constructor(
    @InjectRepository(MovimientoInventario)
    private readonly movimientoRepo: Repository<MovimientoInventario>,

    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,

    @InjectRepository(Bodega)
    private readonly bodegaRepo: Repository<Bodega>,

    @InjectRepository(Kardex)
    private readonly kardexRepo: Repository<Kardex>,

    private readonly kardexService: KardexService,

    private readonly dataSource: DataSource,

    @InjectModel(MovimientoInventarioMongo.name)
    private readonly movimientoMongoModel: Model<MovimientoInventarioDocument>,
  ) {}

  async create(dto: CreateMovimientoDto) {
    return this.dataSource.transaction(async manager => {
      const producto = await manager.findOne(Producto, {
        where: { id_producto: dto.id_producto },
      });
      if (!producto) {
        throw new BadRequestException('Producto no encontrado');
      }

      const bodega = await manager.findOne(Bodega, {
        where: { id_bodega: dto.id_bodega },
      });
      if (!bodega) {
        throw new BadRequestException('Bodega no encontrada');
      }

      if (dto.tipo_movimiento === 'salida' && producto.stock_actual < dto.cantidad) {
        throw new BadRequestException('Stock insuficiente');
      }

      // actualizar stock
      producto.stock_actual =
        dto.tipo_movimiento === 'entrada'
          ? producto.stock_actual + dto.cantidad
          : producto.stock_actual - dto.cantidad;

      await manager.save(producto);

      // movimiento
      const movimiento = manager.create(MovimientoInventario, {
        id_producto: dto.id_producto,
        id_bodega: dto.id_bodega,
        tipo_movimiento: dto.tipo_movimiento,
        cantidad: dto.cantidad,
        fecha_movimiento: new Date(),
        observacion: dto.observacion ?? null,
        id_usuario: dto.id_usuario,
      });

      const movimientoGuardado = await manager.save(movimiento);

      // kardex postgres
      const kardex = manager.create(Kardex, {
        id_producto: dto.id_producto,
        fecha: new Date(),
        tipo: dto.tipo_movimiento,
        cantidad: dto.cantidad,
        saldo: producto.stock_actual,
        descripcion: dto.observacion ?? null,
        id_movimiento: movimientoGuardado.id_movimiento,
      });

      const kardexGuardado = await manager.save(kardex);

      // kardex mongo
      await this.kardexService.guardarEnMongo(kardexGuardado);

      // movimiento mongo
      await this.movimientoMongoModel.create({
        id_movimiento: movimientoGuardado.id_movimiento,
        id_producto: dto.id_producto,
        id_bodega: dto.id_bodega,
        tipo_movimiento: dto.tipo_movimiento,
        cantidad: dto.cantidad,
        fecha_movimiento: movimientoGuardado.fecha_movimiento,
        observacion: dto.observacion,
        id_usuario: dto.id_usuario,
      });

      return {
        mensaje: 'Movimiento registrado con éxito',
        movimiento: movimientoGuardado,
      };
    });
  }

  async findAll() {
    return this.movimientoRepo.find({
      order: { fecha_movimiento: 'DESC' },
    });
  }
}
