import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from 'src/modules/producto/entities/producto.entity';
import { Bodega } from 'src/modules/bodega/entities/bodega.entity';

@Entity('movimiento_inventario')
export class MovimientoInventario {
  @PrimaryGeneratedColumn('uuid')
  id_movimiento: string;

  @ManyToOne(() => Producto, { eager: true })
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;

  @Column({ type: 'uuid' })
  id_producto: string;

  @ManyToOne(() => Bodega, { eager: true })
  @JoinColumn({ name: 'id_bodega' })
  bodega: Bodega;

  @Column({ type: 'uuid' })
  id_bodega: string;

  @Column({ length: 20 })
  tipo_movimiento: 'entrada' | 'salida';

  @Column('int')
  cantidad: number;

  @Column({ type: 'timestamp' })
  fecha_movimiento: Date;

  @Column({ type: 'text', nullable: true })
  observacion: string | null;

  @Column({ type: 'int' })
  id_usuario: number;
}
