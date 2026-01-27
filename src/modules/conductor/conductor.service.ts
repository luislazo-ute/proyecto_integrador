import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conductor } from './entities/conductor.entity';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { ConductorSeq } from './entities/conductor_seq.entity';

@Injectable()
export class ConductorService {
  constructor(
    @InjectRepository(Conductor) private repo: Repository<Conductor>,
    @InjectRepository(ConductorSeq) private seqRepo: Repository<ConductorSeq>,
  ) {}

  async findAll() {
    // Backfill: conductores antiguos no tienen `numero`, así que lo generamos aquí
    // para que el frontend pueda mostrar CON-00X.
    await this.repo.manager.transaction(async (manager) => {
      // 1) Tomamos el máximo actual para no duplicar secuenciales existentes.
      const maxRow = await manager
        .getRepository(Conductor)
        .createQueryBuilder('c')
        .select('COALESCE(MAX(c.numero), 0)', 'max')
        .getRawOne<{ max: string }>();

      const maxNumero = Number(maxRow?.max ?? 0) || 0;

      // 2) Bloqueamos secuencial (1 fila) para asignar de forma segura.
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

      if (!seq) throw new Error('No se pudo inicializar el secuencial de conductores');

      // 3) Sincronizamos last_seq con max(numero) y asignamos a los NULL.
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
    if (!c) throw new NotFoundException('Conductor no encontrado');
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

      if (!seq) throw new Error('No se pudo inicializar el secuencial de conductores');

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
    return this.repo.remove(c);
  }
}
