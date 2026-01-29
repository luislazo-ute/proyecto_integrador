import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transporte } from './entities/transporte.entity';
import { CreateTransporteDto } from './dto/create-transporte.dto';
import { GuiaRemision } from 'src/modules/guia-remision/entities/guia-remision.entity';
@Injectable()
export class TransporteService {
    constructor(
    @InjectRepository(Transporte)
    private repo: Repository<Transporte>, 
    @InjectRepository(GuiaRemision)
    private readonly guiaRepo: Repository<GuiaRemision>) { }
    findAll() {
        return this.repo.find();
    }
    async findOne(id: string) {
        const t = await this.repo.findOne({ where: { id_transporte: id } });
        if (!t)
            throw new NotFoundException('Transporte no encontrado');
        return t;
    }
    create(dto: CreateTransporteDto) {
        const ent = this.repo.create(dto);
        return this.repo.save(ent);
    }
    async update(id: string, dto: Partial<CreateTransporteDto>) {
        const t = await this.findOne(id);
        Object.assign(t, dto);
        return this.repo.save(t);
    }
    async remove(id: string) {
        const t = await this.findOne(id);
        const usedCount = await this.guiaRepo.count({ where: { id_transporte: t.id_transporte } });
        if (usedCount > 0) {
            const previewRows = await this.guiaRepo.find({
                where: { id_transporte: t.id_transporte },
                order: { fecha_emision: 'DESC' },
                take: 3,
            });
            const numeros = previewRows
                .map((g) => g.numero_guia)
                .filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
            const preview = numeros.length ? ` (Ej: ${numeros.join(', ')})` : '';
            throw new ConflictException(`No se puede eliminar el transporte "${t.placa}" porque está asignado a ${usedCount} guía(s) de remisión${preview}. ` +
                'Primero cambia el transporte en esas guías (o desactiva el transporte).');
        }
        try {
            return await this.repo.remove(t);
        }
        catch (e: any) {
            if (e?.code === '23503') {
                throw new ConflictException('No se puede eliminar el transporte porque está siendo usado en otros registros. ' +
                    'Revisa dependencias (guías de remisión, rutas, etc.).');
            }
            throw e;
        }
    }
    async setEstado(id: string, estado: string) {
        const t = await this.findOne(id);
        t.estado = estado;
        return this.repo.save(t);
    }
}
