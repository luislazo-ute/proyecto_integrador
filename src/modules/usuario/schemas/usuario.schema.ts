import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({ collection: 'usuarios', timestamps: true })
export class Usuario {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  email: string;

  @Prop()
  telefono: string;

  @Prop({ default: true })
  estado: boolean;

  @Prop({ type: String, ref: 'Rol', required: true })
  id_rol: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
