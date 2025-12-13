import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transporte } from './entities/transporte.entity';
import { CreateTransporteDto } from './dto/create-transporte.dto';

@Injectable()
export class TransporteService {
  constructor(
    @InjectRepository(Transporte)
    private repo: Repository<Transporte>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: string) {
    const t = await this.repo.findOne({ where: { id_transporte: id } });
    if (!t) throw new NotFoundException('Transporte no encontrado');
    return t;
  }

  create(dto: CreateTransporteDto) {
    const ent = this.repo.create(dto as any);
    return this.repo.save(ent);
  }

  async update(id: string, dto: Partial<CreateTransporteDto>) {
    const t = await this.findOne(id);
    Object.assign(t, dto);
    return this.repo.save(t);
  }

  async remove(id: string) {
    const t = await this.findOne(id);
    return this.repo.remove(t);
  }

  // agregar método para cambiar estado explícitamente
  async setEstado(id: string, estado: string) {
    const t = await this.findOne(id);
    t.estado = estado;
    return this.repo.save(t);
 }
 
}
