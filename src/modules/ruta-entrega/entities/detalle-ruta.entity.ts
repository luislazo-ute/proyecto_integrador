import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RutaEntrega } from './ruta-entrega.entity';

@Entity('detalle_ruta')
export class DetalleRuta {
  @PrimaryGeneratedColumn('uuid')
  id_detalle: string;

  @ManyToOne(() => RutaEntrega, (ruta) => ruta.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_ruta' })
  ruta: RutaEntrega;

  @Column({ type: 'uuid' })
  id_ruta: string;

  @Column({ type: 'uuid' })
  id_bodega_origen: string;

  @Column({ type: 'uuid' })
  id_bodega_destino: string;

  @Column({ type: 'uuid' })
  id_producto: string;

  @Column('int')
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  peso_total: number; // cantidad * producto.peso
}
