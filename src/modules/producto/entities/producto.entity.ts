import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Categoria } from 'src/modules/categoria/entities/categoria.entity';

@Entity('producto')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id_producto: string;

  @ManyToOne(() => Categoria, (categoria) => categoria.id_categoria, { eager: true })
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;

  @Column()
  id_categoria: string;

  @Column({ length: 50, unique: true })
  codigo: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_compra: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_venta: number;

  @Column('int')
  stock_actual: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  peso: number;

  @Column({ length: 50 })
  tipo_unidad: string;

  @Column({ length: 20 })
  unidad_embalaje: string;

  @Column({ default: true })
  estado: boolean;

  @Column({ type: 'text', nullable: true })
  imagen: string | null; // URL o path del archivo
}
