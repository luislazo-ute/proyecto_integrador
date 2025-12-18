import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductoMongo } from './schemas/producto.schema';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,

    @InjectModel(ProductoMongo.name)
    private readonly productoMongoModel: Model<ProductoMongo>,
  ) {}

  async findAll() {
    return this.productoRepository.find();
  }

  async findOne(id: string) {
    const producto = await this.productoRepository.findOne({
      where: { id_producto: id },
    });

    if (!producto) {
      throw new NotFoundException(
        `El producto con id ${id} no existe.`,
      );
    }

    return producto;
  }

  async create(data: CreateProductoDto, imagePath?: string) {
    // 1️⃣ POSTGRES
    const producto = this.productoRepository.create({
      ...data,
      imagen: imagePath || null,
    });

    const saved = await this.productoRepository.save(producto);

    // 2️⃣ MONGO (objeto plano + sin null)
    const mongoData = {
      id_producto: saved.id_producto,
      id_categoria: saved.id_categoria,
      codigo: saved.codigo,
      nombre: saved.nombre,
      descripcion: saved.descripcion,
      precio_compra: saved.precio_compra,
      precio_venta: saved.precio_venta,
      stock_actual: saved.stock_actual,
      peso: saved.peso,
      tipo_unidad: saved.tipo_unidad,
      unidad_embalaje: saved.unidad_embalaje,
      estado: saved.estado,
      imagen: saved.imagen ?? undefined, // 👈 CLAVE
    };

    await new this.productoMongoModel(mongoData).save();

    return saved;
  }

  async update(id: string, data: UpdateProductoDto, imagePath?: string) {
    const producto = await this.findOne(id);

    if (imagePath) producto.imagen = imagePath;
    Object.assign(producto, data);

    const updated = await this.productoRepository.save(producto);

    await this.productoMongoModel.updateOne(
      { id_producto: id },
      {
        $set: {
          id_categoria: updated.id_categoria,
          codigo: updated.codigo,
          nombre: updated.nombre,
          descripcion: updated.descripcion,
          precio_compra: updated.precio_compra,
          precio_venta: updated.precio_venta,
          stock_actual: updated.stock_actual,
          peso: updated.peso,
          tipo_unidad: updated.tipo_unidad,
          unidad_embalaje: updated.unidad_embalaje,
          estado: updated.estado,
          imagen: updated.imagen ?? undefined, // 👈 CLAVE
        },
      },
    );

    return updated;
  }

  async remove(id: string) {
    const producto = await this.findOne(id);

    await this.productoRepository.remove(producto);
    await this.productoMongoModel.deleteOne({ id_producto: id });

    return producto;
  }
}
