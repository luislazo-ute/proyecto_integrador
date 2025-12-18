// src/modules/usuario/schemas/usuario.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = UsuarioMongo & Document;

@Schema({ collection: 'usuarios', timestamps: true })
export class UsuarioMongo {
  @Prop({ required: true })
  id_usuario: number;

  @Prop({ required: true })
  id_rol: number;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  telefono: string;

  @Prop({ default: true })
  estado: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(UsuarioMongo);
