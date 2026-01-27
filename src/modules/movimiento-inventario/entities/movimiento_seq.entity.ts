import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('movimiento_seq')
export class MovimientoSeq {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  last_seq: number;
}
