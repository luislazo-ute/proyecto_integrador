import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('conductor')
export class Conductor {
  @PrimaryGeneratedColumn('uuid')
  id_conductor: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 20 })
  cedula: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 20, nullable: true })
  licencia: string;

  @Column({ default: true })
  estado: boolean;
}
