import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async findAll() {
    return await this.categoriaRepository.find();
  }

  async findOne(id: string) {
    const categoria = await this.categoriaRepository.findOne({ where: { id_categoria: id } });

    if (!categoria) {
      throw new NotFoundException(`La categoría con id ${id} no existe.`);
    }

    return categoria;
  }

  async create(data: CreateCategoriaDto) {
    const categoria = this.categoriaRepository.create(data);
    return await this.categoriaRepository.save(categoria);
  }

  async update(id: string, data: UpdateCategoriaDto) {
    const categoria = await this.findOne(id);

    const updated = Object.assign(categoria, data);
    return await this.categoriaRepository.save(updated);
  }

  async remove(id: string) {
    const categoria = await this.findOne(id);
    return await this.categoriaRepository.remove(categoria);
  }
}
