import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Producto } from '../producto/entities/producto.entity';
@Injectable()
export class CategoriaService {
    constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>, 
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>) { }
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
        const usedBy = await this.productoRepository.count({
            where: { id_categoria: categoria.id_categoria },
        });
        if (usedBy > 0) {
            throw new ConflictException(`No se puede eliminar la categoría porque tiene ${usedBy} producto(s) asociado(s). Primero reasigna o elimina esos productos.`);
        }
        return await this.categoriaRepository.remove(categoria);
    }
}
