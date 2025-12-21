import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Producto } from 'src/modules/producto/entities/producto.entity';
import { MovimientoInventario } from 'src/modules/movimiento-inventario/entities/movimiento-inventario.entity';

@Entity('kardex')
export class Kardex {
  @PrimaryGeneratedColumn('uuid')
  id_kardex: string;

  @ManyToOne(() => Producto, { eager: true })
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;

  @Column()
  id_producto: string;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ length: 20 })
  tipo: 'entrada' | 'salida';

  @Column('int')
  cantidad: number;

  @Column('int')
  saldo: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @ManyToOne(() => MovimientoInventario, { eager: true })
  @JoinColumn({ name: 'id_movimiento' })
  movimiento: MovimientoInventario;

  @Column()
  id_movimiento: string;
}
