import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from 'src/modules/producto/entities/producto.entity';
import { Bodega } from 'src/modules/bodega/entities/bodega.entity';

@Entity('stock_bodega')
@Unique(['id_producto', 'id_bodega'])
export class StockBodega {
  @PrimaryGeneratedColumn('uuid')
  id_stock: string;

  @Column({ type: 'uuid' })
  id_producto: string;

  @ManyToOne(() => Producto, { eager: true })
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;

  @Column({ type: 'uuid' })
  id_bodega: string;

  @ManyToOne(() => Bodega, { eager: true })
  @JoinColumn({ name: 'id_bodega' })
  bodega: Bodega;

  @Column({ type: 'int', default: 0 })
  stock: number;
}
