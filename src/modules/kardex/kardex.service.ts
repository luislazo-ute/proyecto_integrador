import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { KardexMongo, KardexDocument } from './schemas/kardex.schema';
import { Kardex } from './entities/kardex.entity';

@Injectable()
export class KardexService {
  constructor(
    @InjectModel(KardexMongo.name)
    private readonly kardexMongoModel: Model<KardexDocument>,
  ) {}

  async guardarEnMongo(kardex: Kardex) {
    await this.kardexMongoModel.create({
      id_kardex: kardex.id_kardex,
      id_producto: kardex.id_producto,
      fecha: kardex.fecha,
      tipo: kardex.tipo,
      cantidad: kardex.cantidad,
      saldo: kardex.saldo,
      descripcion: kardex.descripcion ?? undefined,
      id_movimiento: kardex.id_movimiento,
    });
  }

  async obtenerPorProducto(id_producto: string) {
    return this.kardexMongoModel
      .find({ id_producto })
      .sort({ fecha: 1 })
      .exec();
  }
}
