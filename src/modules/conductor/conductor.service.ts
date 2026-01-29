import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conductor } from './entities/conductor.entity';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { ConductorSeq } from './entities/conductor_seq.entity';
import { GuiaRemision } from 'src/modules/guia-remision/entities/guia-remision.entity';
@Injectable()
export class ConductorService {
    constructor(
    @InjectRepository(Conductor)
    private repo: Repository<Conductor>, 
    @InjectRepository(ConductorSeq)
    private seqRepo: Repository<ConductorSeq>, 
    @InjectRepository(GuiaRemision)
    private readonly guiaRepo: Repository<GuiaRemision>) { }
    async findAll() {
        await this.repo.manager.transaction(async (manager) => {
            const maxRow = await manager
                .getRepository(Conductor)
                .createQueryBuilder('c')
                .select('COALESCE(MAX(c.numero), 0)', 'max')
                .getRawOne<{
                max: string;
            }>();
            const maxNumero = Number(maxRow?.max ?? 0) || 0;
            let seq = await manager.findOne(ConductorSeq, {
                where: {},
                lock: { mode: 'pessimistic_write' },
            });
            if (!seq) {
                const created = manager.create(ConductorSeq, { last_seq: maxNumero });
                await manager.save(created);
                seq = await manager.findOne(ConductorSeq, {
                    where: { id: created.id },
                    lock: { mode: 'pessimistic_write' },
                });
            }
            if (!seq)
                throw new Error('No se pudo inicializar el secuencial de conductores');
            if (seq.last_seq < maxNumero) {
                seq.last_seq = maxNumero;
            }
            const sinNumero = await manager
                .getRepository(Conductor)
                .createQueryBuilder('c')
                .where('c.numero IS NULL')
                .orderBy('c.id_conductor', 'ASC')
                .getMany();
            if (sinNumero.length) {
                for (const c of sinNumero) {
                    seq.last_seq += 1;
                    c.numero = seq.last_seq;
                    await manager.save(c);
                }
                await manager.save(seq);
            }
        });
        return this.repo
            .createQueryBuilder('c')
            .orderBy('c.numero', 'ASC', 'NULLS LAST')
            .addOrderBy('c.nombre', 'ASC')
            .getMany();
    }
    async findOne(id: string) {
        const c = await this.repo.findOne({ where: { id_conductor: id } });
        if (!c)
            throw new NotFoundException('Conductor no encontrado');
        return c;
    }
    async create(dto: CreateConductorDto) {
        return this.repo.manager.transaction(async (manager) => {
            let seq = await manager.findOne(ConductorSeq, {
                where: {},
                lock: { mode: 'pessimistic_write' },
            });
            if (!seq) {
                const created = manager.create(ConductorSeq, { last_seq: 0 });
                await manager.save(created);
                seq = await manager.findOne(ConductorSeq, {
                    where: { id: created.id },
                    lock: { mode: 'pessimistic_write' },
                });
            }
            if (!seq)
                throw new Error('No se pudo inicializar el secuencial de conductores');
            seq.last_seq += 1;
            await manager.save(seq);
            const ent = manager.create(Conductor, {
                ...dto,
                numero: seq.last_seq,
            });
            return manager.save(ent);
        });
    }
    async update(id: string, dto: Partial<CreateConductorDto>) {
        const c = await this.findOne(id);
        Object.assign(c, dto);
        return this.repo.save(c);
    }
    async remove(id: string) {
        const c = await this.findOne(id);
        const usedCount = await this.guiaRepo.count({ where: { id_conductor: c.id_conductor } });
        if (usedCount > 0) {
            const previewRows = await this.guiaRepo.find({
                where: { id_conductor: c.id_conductor },
                order: { fecha_emision: 'DESC' },
                take: 3,
            });
            const numeros = previewRows
                .map((g) => g.numero_guia)
                .filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
            const preview = numeros.length ? ` (Ej: ${numeros.join(', ')})` : '';
            const label = `${c.nombre} (${c.cedula})`;
            throw new ConflictException(`No se puede eliminar el conductor "${label}" porque está asignado a ${usedCount} guía(s) de remisión${preview}. ` +
                'Primero cambia el conductor en esas guías (o desactiva el conductor).');
        }
        try {
            return await this.repo.remove(c);
        }
        catch (e: any) {
            if (e?.code === '23503') {
                throw new ConflictException('No se puede eliminar el conductor porque está siendo usado en otros registros. ' +
                    'Revisa dependencias (guías de remisión, rutas, etc.).');
            }
            throw e;
        }
    }
}
