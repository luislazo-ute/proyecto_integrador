import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RutaEntregaDocument = HydratedDocument<RutaEntregaMongo>;

@Schema({ timestamps: true, collection: 'rutas_entrega' })
export class RutaEntregaMongo {
  @Prop({ required: true })
  id_ruta: string;

  @Prop({ required: true })
  origen: string;

  @Prop({ required: true })
  destino: string;

  @Prop()
  fecha_salida?: Date;

  @Prop()
  fecha_llegada?: Date;

  @Prop()
  estado: string;

  @Prop()
  peso_total_carga: number;

  @Prop()
  id_transporte?: string;

  @Prop()
  id_conductor?: string;
}

export const RutaEntregaMongoSchema =
  SchemaFactory.createForClass(RutaEntregaMongo);
