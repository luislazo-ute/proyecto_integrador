import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('producto_codigo_seq')
export class ProductoCodigoSeq {
  @PrimaryColumn({ type: 'uuid' })
  id_categoria: string;

  @Column({ type: 'int', default: 0 })
  last_seq: number;
}
