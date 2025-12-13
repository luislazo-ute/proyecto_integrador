import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Transporte } from '../../transporte/entities/transporte.entity';
import { Conductor } from '../../conductor/entities/conductor.entity';
import { DetalleRuta } from './detalle-ruta.entity';

@Entity('ruta_entrega')
export class RutaEntrega {
  @PrimaryGeneratedColumn('uuid')
  id_ruta: string;

  @Column({ length: 100 })
  origen: string;

  @Column({ length: 100 })
  destino: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_salida: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  fecha_llegada: Date | null;

  @Column({ length: 20, default: 'en proceso' })
  estado: string; // en proceso, completada, cancelada, confirmada

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  peso_total_carga: number; // kg totales

  @Column({ type: 'uuid', nullable: true })
  id_transporte: string | null;

  @Column({ type: 'uuid', nullable: true })
  id_conductor: string | null;

  @OneToMany(() => DetalleRuta, d => d.ruta, { cascade: true })
  detalles: DetalleRuta[];
}
