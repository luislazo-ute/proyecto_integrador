import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('bodega')
export class Bodega {
  @PrimaryGeneratedColumn('uuid')
  id_bodega: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 150 })
  ubicacion: string;

  // Usuarios vienen de Mongo → guardamos solo el ID
  @Column({ type: 'uuid', nullable: true })
  responsable: string;
}
