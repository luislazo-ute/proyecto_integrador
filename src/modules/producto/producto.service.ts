import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  async findAll() {
    return await this.productoRepository.find();
  }

  async findOne(id: string) {
    const producto = await this.productoRepository.findOne({
      where: { id_producto: id },
    });
    if (!producto) {
      throw new NotFoundException(`El producto con id ${id} no existe.`);
    }
    return producto;
  }

  async create(data: CreateProductoDto, imagePath?: string) {
    const producto = this.productoRepository.create({
      ...data,
      imagen: imagePath || null,
    });
    return await this.productoRepository.save(producto);
  }

  async update(id: string, data: UpdateProductoDto, imagePath?: string) {
    const producto = await this.findOne(id);

    if (imagePath) producto.imagen = imagePath;

    Object.assign(producto, data);
    return await this.productoRepository.save(producto);
  }

  async remove(id: string) {
    const producto = await this.findOne(id);
    return await this.productoRepository.remove(producto);
  }
}
