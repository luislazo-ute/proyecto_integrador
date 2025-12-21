import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario } from './schemas/usuario.schema';

type UsuarioCreateUpdate = Partial<Omit<Usuario, 'password'>> & {
  password?: string;
};

@Injectable()
export class UsuarioService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
  ) {}

  async create(data: UsuarioCreateUpdate) {
    const password = data.password;
    if (!password) {
      // Mantener consistencia con validación por DTO/pipe
      throw new BadRequestException('Password requerido');
    }

    const hash = await bcrypt.hash(password, 10);
    return this.usuarioModel.create({
      ...data,
      password: hash,
    });
  }

  findAll() {
    return this.usuarioModel.find().populate('id_rol');
  }

  async findOne(id: string) {
    const user = await this.usuarioModel
      .findOne({ _id: id })
      .populate('id_rol');
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: string, data: UsuarioCreateUpdate) {
    if (typeof data.password === 'string' && data.password.trim()) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await this.usuarioModel.findOneAndUpdate({ _id: id }, data, {
      new: true,
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async remove(id: string) {
    const user = await this.usuarioModel.findOneAndDelete({ _id: id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return { message: 'Usuario eliminado' };
  }
  async findByUsername(username: string) {
    return this.usuarioModel.findOne({ username, estado: true });
  }
}
