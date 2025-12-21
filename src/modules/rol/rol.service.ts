import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rol } from './schemas/rol.schema';
import { CreateRolDto } from './dto/create-rol.dto';

@Injectable()
export class RolService {
  constructor(@InjectModel(Rol.name) private rolModel: Model<Rol>) {}

  create(dto: CreateRolDto) {
    return this.rolModel.create(dto);
  }

  findAll() {
    return this.rolModel.find();
  }

  async findByNombre(nombre: string) {
    return this.rolModel.findOne({ nombre });
  }

  async findOne(id: string) {
    const rol = await this.rolModel.findOne({ _id: id });
    if (!rol) throw new NotFoundException('Rol no encontrado');
    return rol;
  }

  async update(id: string, dto: Record<string, unknown>) {
    const rol = await this.rolModel.findOneAndUpdate({ _id: id }, dto, {
      new: true,
    });
    if (!rol) throw new NotFoundException('Rol no encontrado');
    return rol;
  }

  async remove(id: string) {
    const rol = await this.rolModel.findOneAndDelete({ _id: id });
    if (!rol) throw new NotFoundException('Rol no encontrado');
    return { message: 'Rol eliminado' };
  }
}
