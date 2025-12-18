import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConductorDocument = HydratedDocument<ConductorMongoose>;

@Schema({
  timestamps: true,
  collection: 'conductores',
})
export class ConductorMongoose {
  @Prop({ required: true, maxlength: 100 })
  nombre: string;

  @Prop({ required: true, maxlength: 20 })
  cedula: string;

  @Prop({ maxlength: 20 })
  telefono?: string;

  @Prop({ maxlength: 20 })
  licencia?: string;

  @Prop({ default: true })
  estado: boolean;
}

export const ConductorMongooseSchema =
  SchemaFactory.createForClass(ConductorMongoose);
