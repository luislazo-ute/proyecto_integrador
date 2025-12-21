import { Injectable } from '@nestjs/common';
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

  async findAll(filter: FilterKardexDto) {
    const query = this.kardexRepo
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.producto', 'producto')
      .leftJoinAndSelect('k.movimiento', 'movimiento')
      .orderBy('k.fecha', 'ASC');

    if (filter.id_producto) {
      query.andWhere('k.id_producto = :id_producto', {
        id_producto: filter.id_producto,
      });
    }

    if (filter.fecha_inicio && filter.fecha_fin) {
      query.andWhere('k.fecha BETWEEN :inicio AND :fin', {
        inicio: filter.fecha_inicio,
        fin: filter.fecha_fin,
      });
    } else if (filter.fecha_inicio) {
      query.andWhere('k.fecha >= :inicio', { inicio: filter.fecha_inicio });
    } else if (filter.fecha_fin) {
      query.andWhere('k.fecha <= :fin', { fin: filter.fecha_fin });
    }

    return query.getMany();
  }
}
