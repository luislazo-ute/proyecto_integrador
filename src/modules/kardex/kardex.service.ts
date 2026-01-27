import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kardex } from './entities/kardex.entity';
import { FilterKardexDto } from './dto/filter-kardex.dto';

@Injectable()
export class KardexService {
  constructor(
    @InjectRepository(Kardex)
    private readonly kardexRepo: Repository<Kardex>,
  ) {}

  private normalizeRole(raw: any): string {
    return String(raw ?? '').toUpperCase().trim();
  }

  async findAll(
    filter: FilterKardexDto,
    auth?: { userId: string; role: string | null; bodegaId?: string | null },
  ) {
    const role = this.normalizeRole(auth?.role);
    if (role === 'BODEGA') {
      const userBodega = String(auth?.bodegaId ?? '').trim();
      if (!userBodega) throw new ForbiddenException('El usuario no tiene bodega asignada');

      const requested = String((filter as any)?.id_bodega ?? '').trim();
      if (requested && requested !== userBodega) {
        throw new ForbiddenException('No puedes consultar kardex de otra bodega');
      }

      (filter as any).id_bodega = userBodega;
    }

    const query = this.kardexRepo
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.producto', 'producto')
      .leftJoinAndSelect('k.movimiento', 'movimiento')
      .orderBy('k.fecha', 'DESC');

    if (filter.id_producto) {
      query.andWhere('k.id_producto = :id_producto', {
        id_producto: filter.id_producto,
      });
    }

    if (filter.id_bodega) {
      query.andWhere('k.id_bodega = :id_bodega', {
        id_bodega: filter.id_bodega,
      });
    }

    if (filter.tipo) {
      query.andWhere('k.tipo = :tipo', {
        tipo: filter.tipo,
      });
    }

    const inicio = filter.fecha_inicio ? new Date(filter.fecha_inicio) : null;
    const fin = filter.fecha_fin ? new Date(filter.fecha_fin) : null;

    if (inicio && fin) {
      query.andWhere('k.fecha BETWEEN :inicio AND :fin', { inicio, fin });
    } else if (inicio) {
      query.andWhere('k.fecha >= :inicio', { inicio });
    } else if (fin) {
      query.andWhere('k.fecha <= :fin', { fin });
    }

    return query.getMany();
  }
}
