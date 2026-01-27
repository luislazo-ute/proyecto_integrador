import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario } from './schemas/usuario.schema';

const MONGO_OBJECT_ID_RE = /^[a-f\d]{24}$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UsuarioCreateUpdate = Partial<Omit<Usuario, 'password'>> & {
  password?: string;
};

@Injectable()
export class UsuarioService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
  ) {}

  private buildIdQuery(id: string): any {
    const normalized = String(id ?? '').trim();
    if (MONGO_OBJECT_ID_RE.test(normalized)) {
      return {
        $or: [
          { _id: normalized },
          { _id: new Types.ObjectId(normalized) },
        ],
      } as any;
    }

    return { _id: normalized };
  }

  async findManyLiteByIds(ids: string[]) {
    const uniqueIds = [...new Set((ids ?? []).map((x) => String(x ?? '').trim()).filter(Boolean))];
    if (!uniqueIds.length) return [];

    const fromUuidSchema = await this.usuarioModel
      .find({ _id: { $in: uniqueIds }, estado: true })
      .select('_id nombre username')
      .lean();

    const objectIdStrings = uniqueIds.filter((id) => MONGO_OBJECT_ID_RE.test(id));
    if (!objectIdStrings.length) return fromUuidSchema;

    const objectIds = objectIdStrings.map((id) => new Types.ObjectId(id));
    const fromLegacyObjectIds = await this.usuarioModel.collection
      .find(
        { _id: { $in: objectIds }, estado: true },
        { projection: { _id: 1, nombre: 1, username: 1 } },
      )
      .toArray();

    const merged = [...(fromUuidSchema ?? [])];
    for (const raw of fromLegacyObjectIds ?? []) {
      const id = String((raw as any)?._id ?? '').trim();
      if (!id) continue;
      if (merged.some((u: any) => String(u?._id ?? '').trim() === id)) continue;
      merged.push({
        _id: id,
        nombre: (raw as any).nombre,
        username: (raw as any).username,
      } as any);
    }

    return merged;
  }

  async create(data: UsuarioCreateUpdate) {
    const password = data.password;
    if (!password) throw new BadRequestException('Password requerido');

    const hash = await bcrypt.hash(password, 10);
    return this.usuarioModel.create({
      ...data,
      password: hash,
    });
  }

  findAll() {
    // ✅ Importante: devolvemos objetos planos para asegurar que `_id` se serialice
    // (en algunos setups, el transform del schema puede ocultar `_id` en JSON).
    return this.usuarioModel
      .find()
      .select('-password')
      .populate('id_rol')
      .lean()
      .then((users: any[]) =>
        (users ?? []).map((u: any) => ({
          ...u,
          _id: typeof u?._id === 'string' ? u._id : String(u?._id ?? ''),
        })),
      );
  }

  async findOne(id: string) {
    const normalized = String(id ?? '').trim();

    const user = await this.usuarioModel
      .findOne({ _id: normalized })
      .select('-password')
      .populate('id_rol')
      .lean();

    if (user) {
      return {
        ...user,
        _id:
          typeof (user as any)?._id === 'string'
            ? (user as any)._id
            : String((user as any)?._id ?? ''),
      } as any;
    }

    // Legacy fallback: usuarios creados con ObjectId antes de migrar a UUID strings.
    if (MONGO_OBJECT_ID_RE.test(normalized)) {
      const raw = await this.usuarioModel.collection.findOne({
        _id: new Types.ObjectId(normalized),
      });

      if (!raw) throw new NotFoundException('Usuario no encontrado');
      const { password, ...rest } = raw as any;
      return { ...rest, _id: String((raw as any)._id ?? '') } as any;
    }

    throw new NotFoundException('Usuario no encontrado');
  }

  async update(id: string, data: UsuarioCreateUpdate) {
    if (typeof data.password === 'string' && data.password.trim()) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const normalized = String(id ?? '').trim();

    const user = await this.usuarioModel.findOneAndUpdate({ _id: normalized } as any, data, {
      new: true,
    });

    if (!user && MONGO_OBJECT_ID_RE.test(normalized)) {
      const updatedResult = await this.usuarioModel.collection.findOneAndUpdate(
        { _id: new Types.ObjectId(normalized) },
        { $set: data },
        { returnDocument: 'after' },
      );

      const updated =
        updatedResult && typeof updatedResult === 'object' && 'value' in updatedResult
          ? (updatedResult as any).value
          : (updatedResult as any);

      if (!updated) throw new NotFoundException('Usuario no encontrado');
      const { password, ...rest } = updated as any;
      return { ...rest, _id: String((updated as any)._id ?? '') } as any;
    }

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async remove(id: string) {
    const normalized = String(id ?? '').trim();
    const user = await this.usuarioModel.findOneAndDelete({ _id: normalized } as any);
    if (user) return { message: 'Usuario eliminado' };

    if (MONGO_OBJECT_ID_RE.test(normalized)) {
      const deletedResult = await this.usuarioModel.collection.findOneAndDelete({
        _id: new Types.ObjectId(normalized),
      });

      const deleted =
        deletedResult && typeof deletedResult === 'object' && 'value' in deletedResult
          ? (deletedResult as any).value
          : (deletedResult as any);

      if (deleted) return { message: 'Usuario eliminado' };
    }

    throw new NotFoundException('Usuario no encontrado');
  }

  async findByUsername(username: string) {
    return this.usuarioModel
      .findOne({ username, estado: true })
      .populate('id_rol');
  }

  async updateByUsername(username: string, data: any) {
    const user = await this.usuarioModel.findOneAndUpdate({ username }, data, {
      new: true,
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // ✅ ENDPOINT PARA SELECT DE RESPONSABLES (solo ADMIN/BODEGA)
  async listResponsables() {
    const users = await this.usuarioModel
      .find({ estado: true })
      .select('_id nombre username id_rol estado')
      .populate('id_rol')
      .lean();

    return users
      .filter((u: any) => {
        const rolNombre = String(u?.id_rol?.nombre || '').toUpperCase();
        return rolNombre === 'ADMIN' || rolNombre === 'BODEGA';
      })
      .map((u: any) => {
        const id = typeof u?._id === 'string' ? u._id : String(u?._id ?? '');
        return {
          _id: id,
          nombre: u.nombre,
          username: u.username,
          rol: u?.id_rol?.nombre ?? null,
        };
      })
      .filter((u: any) => {
        const id = String(u?._id ?? '').trim();
        return MONGO_OBJECT_ID_RE.test(id) || UUID_RE.test(id);
      });
  }
}
