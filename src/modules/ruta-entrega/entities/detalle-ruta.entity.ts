import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, } from 'typeorm';
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
    @Column({ type: 'uuid', nullable: true })
    id_bodega_origen: string | null;
    @Column({ type: 'uuid', nullable: true })
    id_bodega_destino: string | null;
    @Column({ type: 'uuid', nullable: true })
    id_producto: string | null;
    @Column('int', { nullable: true })
    cantidad: number | null;
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
    peso_total: number | null;
    @Column({ type: 'varchar', length: 255, nullable: true })
    direccion_entrega: string | null;
    @Column({ type: 'varchar', length: 120, nullable: true })
    destinatario: string | null;
    @Column({ type: 'varchar', length: 40, nullable: true })
    telefono: string | null;
    @Column({ type: 'varchar', length: 30, default: 'pendiente' })
    estado: string;
}
