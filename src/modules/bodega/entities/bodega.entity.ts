import { Entity, PrimaryGeneratedColumn, Column, Generated } from 'typeorm';
@Entity('bodega')
export class Bodega {
    @PrimaryGeneratedColumn('uuid')
    id_bodega: string;
    @Column({ type: 'int', unique: true })
    @Generated('increment')
    numero: number;
    @Column({ length: 100 })
    nombre: string;
    @Column({ length: 150 })
    ubicacion: string;
    @Column({ type: 'varchar', length: 36, nullable: true })
    responsable: string | null;
}
