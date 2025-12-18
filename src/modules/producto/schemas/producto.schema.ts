import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'productos' })
export class ProductoMongo extends Document {
  @Prop({ required: true })
  id_producto: string;

  @Prop()
  id_categoria: string;

  @Prop()
  codigo: string;

  @Prop()
  nombre: string;

  @Prop()
  descripcion?: string;

  @Prop()
  precio_compra: number;

  @Prop()
  precio_venta: number;

  @Prop()
  stock_actual: number;

  @Prop()
  peso: number;

  @Prop()
  tipo_unidad: string;

  @Prop()
  unidad_embalaje: string;

  @Prop()
  estado: boolean;

  @Prop()
  imagen?: string;
}

export const ProductoMongoSchema =
  SchemaFactory.createForClass(ProductoMongo);
