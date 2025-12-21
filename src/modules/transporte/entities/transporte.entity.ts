import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('transporte')
export class Transporte {
  @PrimaryGeneratedColumn('uuid')
  id_transporte: string;

  @Column({ length: 20 })
  placa: string;

  @Column({ length: 50 })
  tipo_vehiculo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  capacidad: number;

  @Column({ length: 20, default: 'disponible' })
  estado: string;
}
