import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
export type RolDocument = HydratedDocument<Rol>;
@Schema({ collection: 'roles', timestamps: true })
export class Rol {
    @Prop({ type: String, default: uuidv4 })
    _id: string;
    @Prop({ required: true, unique: true })
    nombre: string;
    @Prop()
    descripcion: string;
}
export const RolSchema = SchemaFactory.createForClass(Rol);
