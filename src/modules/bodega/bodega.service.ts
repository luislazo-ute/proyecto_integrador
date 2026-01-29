import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bodega } from './entities/bodega.entity';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Usuario } from '../usuario/schemas/usuario.schema';
import { Rol } from '../rol/schemas/rol.schema';
import { StockBodega } from '../stock-bodega/entities/stock-bodega.entity';
type ResponsableView = {
    responsable_nombre?: string;
    responsable_username?: string;
};
@Injectable()
export class BodegaService {
    constructor(
    @InjectRepository(Bodega)
    private readonly bodegaRepository: Repository<Bodega>, 
    @InjectRepository(StockBodega)
    private readonly stockBodegaRepo: Repository<StockBodega>, 
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<Usuario>, 
    @InjectModel(Rol.name)
    private readonly rolModel: Model<Rol>) { }
    private normalizeRole(raw: any): string {
        return String(raw ?? '').toUpperCase().trim();
    }
    private async resolveUserBodegaId(auth: {
        userId: string;
        role: string | null;
        bodegaId?: string | null;
    }): Promise<string | null> {
        const role = this.normalizeRole(auth?.role);
        if (role !== 'BODEGA')
            return null;
        const fromToken = String(auth?.bodegaId ?? '').trim();
        if (fromToken)
            return fromToken;
        if (!auth?.userId)
            return null;
        const user = await this.usuarioModel.findOne({ _id: auth.userId }).lean();
        const fromDb = String((user as any)?.id_bodega ?? '').trim();
        return fromDb || null;
    }
    private async assertCanReadBodega(auth: {
        userId: string;
        role: string | null;
        bodegaId?: string | null;
    }, id_bodega: string) {
        if (!auth?.userId)
            throw new ForbiddenException('No autenticado');
        if (this.normalizeRole(auth.role) !== 'BODEGA')
            return;
        const userBodega = (await this.resolveUserBodegaId(auth)) ?? '';
        if (!userBodega || userBodega !== id_bodega) {
            throw new ForbiddenException('No puedes consultar otra bodega');
        }
    }
    private async assertResponsableIsBodegaUser(responsable: string) {
        const user = await this.usuarioModel.findOne({ _id: responsable }).lean();
        if (!user)
            throw new BadRequestException('Responsable no existe');
        const rolId = String((user as any).id_rol ?? '').trim();
        if (!rolId)
            throw new BadRequestException('Responsable no tiene rol asignado');
        const rol = await this.rolModel.findOne({ _id: rolId }).lean();
        const rolNombre = this.normalizeRole((rol as any)?.nombre ?? null);
        if (rolNombre !== 'BODEGA') {
            throw new BadRequestException('El responsable debe tener rol BODEGA');
        }
    }
    private async setUsuarioBodega(userId: string, id_bodega: string | null) {
        await this.usuarioModel.updateOne({ _id: userId }, { $set: { id_bodega } } as any).exec();
    }
    private async responsablesById(ids: Array<string | null | undefined>) {
        const unique = Array.from(new Set(ids
            .map((v) => String(v ?? '').trim())
            .filter((v) => v.length > 0)));
        if (unique.length === 0)
            return new Map<string, ResponsableView>();
        const inValues: any[] = [];
        for (const id of unique) {
            inValues.push(id);
            if (/^[a-f\d]{24}$/i.test(id)) {
                try {
                    inValues.push(new Types.ObjectId(id));
                }
                catch {
                }
            }
        }
        const docs = await this.usuarioModel.collection
            .find({ _id: { $in: inValues } } as any, { projection: { nombre: 1, username: 1 } } as any)
            .toArray();
        const map = new Map<string, ResponsableView>();
        for (const d of docs as any[]) {
            const key = String(d._id);
            map.set(key, {
                responsable_nombre: d.nombre,
                responsable_username: d.username,
            });
        }
        return map;
    }
    async findAll(auth: {
        userId: string;
        role: string | null;
        bodegaId?: string | null;
    }) {
        let bodegas: Bodega[] = [];
        const role = this.normalizeRole(auth?.role);
        if (role === 'BODEGA') {
            const id = (await this.resolveUserBodegaId(auth)) ?? '';
            if (!id)
                throw new ForbiddenException('El usuario no tiene bodega asignada');
            bodegas = await this.bodegaRepository.find({
                select: ['id_bodega', 'numero', 'nombre', 'ubicacion'],
                order: { numero: 'ASC' },
            });
        }
        else {
            bodegas = await this.bodegaRepository.find({
                order: { numero: 'ASC' },
            });
        }
        if (role === 'BODEGA')
            return bodegas;
        const responsablesMap = await this.responsablesById(bodegas.map((b) => b.responsable));
        return bodegas.map((b) => {
            const view = b.responsable ? responsablesMap.get(String(b.responsable)) : undefined;
            return { ...b, ...(view ?? {}) };
        });
    }
    async findOne(id: string, auth?: {
        userId: string;
        role: string | null;
        bodegaId?: string | null;
    }) {
        if (auth)
            await this.assertCanReadBodega(auth, id);
        const bodega = await this.bodegaRepository.findOne({
            where: { id_bodega: id },
        });
        if (!bodega) {
            throw new NotFoundException(`La bodega con id ${id} no existe.`);
        }
        const responsablesMap = await this.responsablesById([bodega.responsable]);
        const view = bodega.responsable ? responsablesMap.get(String(bodega.responsable)) : undefined;
        return {
            ...bodega,
            ...(view ?? {}),
        };
    }
    async create(data: CreateBodegaDto) {
        if (data?.responsable) {
            await this.assertResponsableIsBodegaUser(String(data.responsable));
        }
        const bodega = this.bodegaRepository.create(data);
        const saved = await this.bodegaRepository.save(bodega);
        if (data?.responsable) {
            await this.setUsuarioBodega(String(data.responsable), saved.id_bodega);
        }
        return saved;
    }
    async update(id: string, data: UpdateBodegaDto) {
        const existing = await this.bodegaRepository.findOne({ where: { id_bodega: id } });
        if (!existing)
            throw new NotFoundException(`La bodega con id ${id} no existe.`);
        const prevResponsable = String((existing as any).responsable ?? '').trim() || null;
        if (data?.responsable !== undefined) {
            const nextResp = data.responsable ? String(data.responsable).trim() : null;
            if (nextResp) {
                await this.assertResponsableIsBodegaUser(nextResp);
            }
            if (prevResponsable && prevResponsable !== nextResp) {
                await this.setUsuarioBodega(prevResponsable, null);
            }
            if (nextResp && nextResp !== prevResponsable) {
                await this.setUsuarioBodega(nextResp, id);
            }
        }
        Object.assign(existing, data);
        return await this.bodegaRepository.save(existing);
    }
    async remove(id: string) {
        const bodega = await this.bodegaRepository.findOne({ where: { id_bodega: id } });
        if (!bodega)
            throw new NotFoundException(`La bodega con id ${id} no existe.`);
        const usedCount = await this.stockBodegaRepo.count({ where: { id_bodega: bodega.id_bodega } });
        if (usedCount > 0) {
            const previewRows = await this.stockBodegaRepo.find({
                where: { id_bodega: bodega.id_bodega },
                take: 3,
            });
            const productos = previewRows
                .map((r) => {
                const nombre = (r as any)?.producto?.nombre;
                const codigo = (r as any)?.producto?.codigo;
                if (typeof nombre === 'string' && nombre.trim()) {
                    return typeof codigo === 'string' && codigo.trim() ? `${nombre} (${codigo})` : nombre;
                }
                return null;
            })
                .filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
            const preview = productos.length ? ` Productos: ${productos.join(', ')}.` : '';
            throw new ConflictException(`No se puede eliminar la bodega "${bodega.nombre}" porque tiene stock registrado (${usedCount} registro(s)).` +
                preview +
                ' Primero mueve/elimina ese stock (o desactiva la bodega).');
        }
        const responsable = String((bodega as any).responsable ?? '').trim() || null;
        try {
            const res = await this.bodegaRepository.remove(bodega);
            if (responsable) {
                await this.setUsuarioBodega(responsable, null);
            }
            return res;
        }
        catch (e: any) {
            if (e?.code === '23503') {
                throw new ConflictException('No se puede eliminar la bodega porque está siendo usada en otros registros. ' +
                    'Revisa dependencias (stock, movimientos, rutas, etc.).');
            }
            throw e;
        }
    }
}
