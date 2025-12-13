import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GuiaRemision } from './guia-remision.entity';

@Entity('detalle_guia_remision')
export class DetalleGuiaRemision {
  @PrimaryGeneratedColumn('uuid')
  id_detalle_guia: string;

  @ManyToOne(() => GuiaRemision, guia => guia.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_guia' })
  guia: GuiaRemision;

  @Column()
  id_guia: string;

  @Column()
  id_producto: string;

  @Column('int')
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  peso_total: number;

  @Column({ type: 'text', nullable: true })
  observacion: string | null;
}
