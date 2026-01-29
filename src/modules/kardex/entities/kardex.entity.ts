import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from 'src/modules/producto/entities/producto.entity';
import { Movimiento } from 'src/modules/movimiento-inventario/entities/movimiento.entity';
@Entity('kardex')
export class Kardex {
    @PrimaryGeneratedColumn('uuid')
    id_kardex: string;
    @ManyToOne(() => Producto, { eager: true })
    @JoinColumn({ name: 'id_producto' })
    producto: Producto;
    @Column({ type: 'uuid' })
    id_producto: string;
    @Column({ type: 'uuid' })
    id_bodega: string;
    @Column({ type: 'uuid' })
    id_usuario: string;
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
    @ManyToOne(() => Movimiento, { eager: true })
    @JoinColumn({ name: 'id_movimiento' })
    movimiento: Movimiento;
    @Column({ type: 'uuid' })
    id_movimiento: string;
}
