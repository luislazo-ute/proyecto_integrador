import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { RutaEntrega } from 'src/modules/ruta-entrega/entities/ruta-entrega.entity';
import { Transporte } from 'src/modules/transporte/entities/transporte.entity';
import { Conductor } from 'src/modules/conductor/entities/conductor.entity';
import { DetalleGuiaRemision } from './detalle-guia.entity';

@Entity('guia_remision')
export class GuiaRemision {
  @PrimaryGeneratedColumn('uuid')
  id_guia: string;

  @Column({ unique: true })
  numero_guia: string;

  @Column({ type: 'timestamp' })
  fecha_emision: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_inicio_transporte: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  fecha_fin_transporte: Date | null;

  @Column()
  punto_partida: string;

  @Column()
  punto_llegada: string;

  @Column()
  motivo_traslado: string;

  @ManyToOne(() => RutaEntrega, { eager: true })
  @JoinColumn({ name: 'id_ruta' })
  ruta: RutaEntrega;

  @Column()
  id_ruta: string;

  @ManyToOne(() => Transporte, { eager: true })
  @JoinColumn({ name: 'id_transporte' })
  transporte: Transporte;

  @Column()
  id_transporte: string;

  @ManyToOne(() => Conductor, { eager: true })
  @JoinColumn({ name: 'id_conductor' })
  conductor: Conductor;

  @Column()
  id_conductor: string;

  @Column({ type: 'uuid', nullable: true })
  id_usuario_encargado: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  peso_total: number;

  @Column({ length: 20, default: 'emitida' })
  estado: string; // emitida, en transito, finalizada

  @OneToMany(() => DetalleGuiaRemision, (d) => d.guia, { cascade: true })
  detalles: DetalleGuiaRemision[];
}
