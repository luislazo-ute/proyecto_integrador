import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KardexDocument = KardexMongo & Document;

@Schema({ collection: 'kardex' })
export class KardexMongo {
  @Prop({ required: true })
  id_kardex: string;

  @Prop({ required: true })
  id_producto: string;

  @Prop({ required: true })
  fecha: Date;

  @Prop({ required: true })
  tipo: 'entrada' | 'salida';

  @Prop({ required: true })
  cantidad: number;

  @Prop({ required: true })
  saldo: number;

  @Prop()
  descripcion?: string;

  @Prop({ required: true })
  id_movimiento: string;
}

export const KardexMongoSchema =
  SchemaFactory.createForClass(KardexMongo);
