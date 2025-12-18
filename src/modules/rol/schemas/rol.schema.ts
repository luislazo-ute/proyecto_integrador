// src/modules/rol/schemas/rol.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RolDocument = RolMongo & Document;

@Schema({ collection: 'roles', timestamps: true })
export class RolMongo {
  @Prop({ required: true })
  id_rol: number;

  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion: string;
}

export const RolSchema = SchemaFactory.createForClass(RolMongo);
