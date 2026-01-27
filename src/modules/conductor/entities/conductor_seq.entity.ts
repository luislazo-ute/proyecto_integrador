import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('conductor_seq')
export class ConductorSeq {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  last_seq: number;
}
