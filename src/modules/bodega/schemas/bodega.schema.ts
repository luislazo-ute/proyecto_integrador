import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Usamos BodegaMongoose para no chocar con la Entity de TypeORM
export type BodegaDocument = HydratedDocument<BodegaMongoose>;

@Schema({
    timestamps: true,
    collection: 'bodegas' // Colección en MongoDB
})
export class BodegaMongoose {
  @Prop({ required: true, unique: true, type: String, maxlength: 100 })
  nombre: string;

  @Prop({ required: true, type: String, maxlength: 150 })
  ubicacion: string;

  // Responsable es un ID de usuario (UUID de TypeORM) guardado como string en Mongo.
  @Prop({ type: String, required: false })
  responsable?: string;
}

export const BodegaMongooseSchema = SchemaFactory.createForClass(BodegaMongoose);