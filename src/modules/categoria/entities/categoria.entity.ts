import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('categoria')
export class Categoria {
    @PrimaryGeneratedColumn('uuid')
    id_categoria: string;
    @Column({ length: 100 })
    nombre: string;
    @Column({ type: 'text', nullable: true })
    descripcion: string;
}
