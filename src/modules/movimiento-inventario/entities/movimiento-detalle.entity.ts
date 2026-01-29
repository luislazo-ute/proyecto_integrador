import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Movimiento } from './movimiento.entity';
import { Producto } from 'src/modules/producto/entities/producto.entity';
@Entity('movimiento_detalle')
export class MovimientoDetalle {
    @PrimaryGeneratedColumn('uuid')
    id_detalle: string;
    @Column({ type: 'uuid' })
    id_movimiento: string;
    @ManyToOne(() => Movimiento, (m) => m.detalles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_movimiento' })
    movimiento: Movimiento;
    @Column({ type: 'uuid' })
    id_producto: string;
    @ManyToOne(() => Producto, { eager: true })
    @JoinColumn({ name: 'id_producto' })
    producto: Producto;
    @Column({ type: 'int' })
    cantidad: number;
}
