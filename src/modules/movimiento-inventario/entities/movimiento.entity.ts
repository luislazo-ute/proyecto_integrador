import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MovimientoDetalle } from './movimiento-detalle.entity';

@Entity('movimiento')
export class Movimiento {
  @PrimaryGeneratedColumn('uuid')
  id_movimiento: string;

  @Column({ unique: true })
  codigo: string; // MOV-000001

  @Column({ type: 'uuid' })
  id_bodega_origen: string;

  @Column({ type: 'uuid' })
  id_bodega_destino: string;

  @Column({ type: 'uuid' })
  id_usuario: string; // Mongo _id (string/uuid), lo guardamos como uuid/string

  @Column({ type: 'timestamp' })
  fecha_movimiento: Date;

  @Column({ type: 'text', nullable: true })
  observacion: string | null;

  @OneToMany(() => MovimientoDetalle, (d) => d.movimiento, { cascade: true, eager: true })
  detalles: MovimientoDetalle[];
}
