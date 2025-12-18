import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GuiaRemisionDocument = HydratedDocument<GuiaRemisionMongo>;

@Schema({
  timestamps: true,
  collection: 'guias_remision',
})
export class GuiaRemisionMongo {
  @Prop({ required: true, index: true })
  id_guia: string; // UUID de Postgres

  @Prop({ required: true, unique: true })
  numero_guia: string;

  @Prop()
  fecha_emision: Date;

  @Prop()
  fecha_inicio_transporte?: Date;

  @Prop()
  fecha_fin_transporte?: Date;

  @Prop()
  punto_partida: string;

  @Prop()
  punto_llegada: string;

  @Prop()
  motivo_traslado: string;

  @Prop()
  id_ruta: string;

  @Prop()
  id_transporte: string;

  @Prop()
  id_conductor: string;

  @Prop({ default: 0 })
  peso_total: number;

  @Prop({ default: 'emitida' })
  estado: string;

  @Prop({
    type: [
      {
        id_producto: String,
        cantidad: Number,
        peso_total: Number,
        observacion: String,
      },
    ],
    default: [],
  })
  detalles: {
    id_producto: string;
    cantidad: number;
    peso_total: number;
    observacion?: string;
  }[];
}

export const GuiaRemisionMongoSchema =
  SchemaFactory.createForClass(GuiaRemisionMongo);
