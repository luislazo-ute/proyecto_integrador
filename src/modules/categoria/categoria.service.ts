import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriaMongoose, CategoriaDocument } from './schemas/categoria.schema';

@Injectable()
export class CategoriaService {
  constructor(
    // POSTGRES
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,

    // MONGODB
    @InjectModel(CategoriaMongoose.name)
    private readonly categoriaMongoModel: Model<CategoriaDocument>,
  ) {}

  async findAll() {
    return await this.categoriaRepository.find();
  }

  async findOne(id: string) {
    const categoria = await this.categoriaRepository.findOne({
      where: { id_categoria: id },
    });

    if (!categoria) {
      throw new NotFoundException(`La categoría con id ${id} no existe.`);
    }

    return categoria;
  }

  async create(data: CreateCategoriaDto) {
    // Guardar en POSTGRES
    const categoria = this.categoriaRepository.create(data);
    const savedCategoria = await this.categoriaRepository.save(categoria);

    //  Guardar en MONGODB
    await this.categoriaMongoModel.create({
      nombre: data.nombre,
      descripcion: data.descripcion,
    });

    //  Respuesta normal
    return savedCategoria;
  }

  async update(id: string, data: UpdateCategoriaDto) {
    const categoria = await this.findOne(id);
    Object.assign(categoria, data);
    return await this.categoriaRepository.save(categoria);
  }

  async remove(id: string) {
    const categoria = await this.findOne(id);
    return await this.categoriaRepository.remove(categoria);
  }
}
