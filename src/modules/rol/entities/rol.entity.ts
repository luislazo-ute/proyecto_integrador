// src/modules/rol/entities/rol.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn()
  id_rol: number;

  @Column({ length: 50 })
  nombre: string;

  @Column({ type: 'text' })
  descripcion: string;
}
