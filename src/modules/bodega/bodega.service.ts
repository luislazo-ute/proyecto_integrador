import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bodega } from './entities/bodega.entity';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';

@Injectable()
export class BodegaService {
  constructor(
    @InjectRepository(Bodega)
    private readonly bodegaRepository: Repository<Bodega>,
  ) {}

  async findAll() {
    return await this.bodegaRepository.find();
  }

  async findOne(id: string) {
    const bodega = await this.bodegaRepository.findOne({
      where: { id_bodega: id },
    });

    if (!bodega) {
      throw new NotFoundException(`La bodega con id ${id} no existe.`);
    }

    return bodega;
  }

  async create(data: CreateBodegaDto) {
    const bodega = this.bodegaRepository.create(data);
    return await this.bodegaRepository.save(bodega);
  }

  async update(id: string, data: UpdateBodegaDto) {
    const bodega = await this.findOne(id);
    Object.assign(bodega, data);

    return await this.bodegaRepository.save(bodega);
  }

  async remove(id: string) {
    const bodega = await this.findOne(id);
    return await this.bodegaRepository.remove(bodega);
  }
}
