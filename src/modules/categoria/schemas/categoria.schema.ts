import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoriaDocument = HydratedDocument<CategoriaMongoose>;

@Schema({
  timestamps: true,
  collection: 'categorias',
})
export class CategoriaMongoose {
  @Prop({ required: true, maxlength: 100 })
  nombre: string;

  @Prop({ type: String })
  descripcion?: string;
}

export const CategoriaMongooseSchema =
  SchemaFactory.createForClass(CategoriaMongoose);
