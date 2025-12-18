import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'transporte' })
export class TransporteMongo {
  @Prop({ required: true })
  id_transporte: string;

  @Prop({ required: true })
  placa: string;

  @Prop({ required: true })
  tipo_vehiculo: string;

  @Prop({ required: true })
  capacidad: number;

  @Prop({ required: true })
  estado: string;
}

export type TransporteDocument = TransporteMongo & Document;
export const TransporteSchema = SchemaFactory.createForClass(TransporteMongo);
