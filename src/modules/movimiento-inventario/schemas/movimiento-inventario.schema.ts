import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MovimientoInventarioDocument = MovimientoInventarioMongo & Document;

@Schema({ collection: 'movimiento_inventario' })
export class MovimientoInventarioMongo {

  @Prop({ required: true })
  id_movimiento: string;

  @Prop({ required: true })
  id_producto: string;

  @Prop({ required: true })
  id_bodega: string;

  @Prop({ required: true, enum: ['entrada', 'salida'] })
  tipo_movimiento: string;

  @Prop({ required: true })
  cantidad: number;

  @Prop({ required: true })
  fecha_movimiento: Date;

  @Prop()
  observacion?: string;

  // 🔥 AQUÍ EL CAMBIO CLAVE
  @Prop({ type: Number, required: true })
  id_usuario: number;
}

export const MovimientoInventarioSchema =
  SchemaFactory.createForClass(MovimientoInventarioMongo);
