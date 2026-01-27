import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Movimiento } from './entities/movimiento.entity';
import { MovimientoDetalle } from './entities/movimiento-detalle.entity';


import { StockBodega } from 'src/modules/stock-bodega/entities/stock-bodega.entity';
import { Producto } from 'src/modules/producto/entities/producto.entity';
import { Bodega } from 'src/modules/bodega/entities/bodega.entity';
import { Kardex } from 'src/modules/kardex/entities/kardex.entity';

import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { FilterMovimientoDto } from './dto/filter-movimiento.dto';
import { UsuarioService } from 'src/modules/usuario/usuario.service';
import { MovimientoSeq } from './entities/movimiento_seq.entity';

function formatMov(n: number) {
  return `MOV-${String(n).padStart(6, '0')}`;
}

@Injectable()
export class MovimientoInventarioService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movRepo: Repository<Movimiento>,

    @InjectRepository(MovimientoDetalle)
    private readonly detRepo: Repository<MovimientoDetalle>,

    @InjectRepository(MovimientoSeq)
    private readonly seqRepo: Repository<MovimientoSeq>,

    @InjectRepository(StockBodega)
    private readonly stockRepo: Repository<StockBodega>,

    @InjectRepository(Producto)
    private readonly prodRepo: Repository<Producto>,

    @InjectRepository(Bodega)
    private readonly bodegaRepo: Repository<Bodega>,

    @InjectRepository(Kardex)
    private readonly kardexRepo: Repository<Kardex>,

    private readonly usuarioService: UsuarioService,
  ) {}

  private normalizeRole(raw: any): string {
    return String(raw ?? '').toUpperCase().trim();
  }

  async findAll(filter?: FilterMovimientoDto) {
    const qb = this.movRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.detalles', 'd')
      .leftJoinAndSelect('d.producto', 'p')
      .orderBy('m.fecha_movimiento', 'DESC');

    const codigo = filter?.codigo?.trim();
    if (codigo) {
      qb.andWhere('LOWER(m.codigo) LIKE :codigo', { codigo: `%${codigo.toLowerCase()}%` });
    }

    if (filter?.id_bodega_origen) {
      qb.andWhere('m.id_bodega_origen = :id_bodega_origen', {
        id_bodega_origen: filter.id_bodega_origen,
      });
    }

    if (filter?.id_bodega_destino) {
      qb.andWhere('m.id_bodega_destino = :id_bodega_destino', {
        id_bodega_destino: filter.id_bodega_destino,
      });
    }

    if (filter?.tipo === 'entrada') {
      qb.andWhere('m.id_bodega_origen = m.id_bodega_destino');
    } else if (filter?.tipo === 'transferencia') {
      qb.andWhere('m.id_bodega_origen <> m.id_bodega_destino');
    }

    if (filter?.fecha_inicio) {
      qb.andWhere('m.fecha_movimiento >= :fecha_inicio', {
        fecha_inicio: new Date(filter.fecha_inicio),
      });
    }

    if (filter?.fecha_fin) {
      qb.andWhere('m.fecha_movimiento <= :fecha_fin', {
        fecha_fin: new Date(filter.fecha_fin),
      });
    }

    if (filter?.id_producto) {
      qb.andWhere('d.id_producto = :id_producto', { id_producto: filter.id_producto });
    }

    const movimientos = await qb.getMany();

    const userIds = [...new Set((movimientos ?? []).map((m) => String((m as any)?.id_usuario ?? '').trim()).filter(Boolean))];
    const users = await this.usuarioService.findManyLiteByIds(userIds);
    const userById = new Map(
      (users ?? []).map((u: any) => [
        String(u?._id ?? ''),
        {
          _id: String(u?._id ?? ''),
          nombre: u?.nombre ?? null,
          username: u?.username ?? null,
        },
      ]),
    );

    return (movimientos ?? []).map((m: any) => ({
      ...m,
      usuario: userById.get(String(m?.id_usuario ?? '')) ?? null,
    }));
  }

  async findOne(id: string) {
    const mov = await this.movRepo.findOne({ where: { id_movimiento: id } });
    if (!mov) throw new NotFoundException('Movimiento no encontrado');
    return mov;
  }

  private mergeItems(items: Array<{ id_producto: string; cantidad: number }>) {
    const merged = new Map<string, number>();
    for (const it of items ?? []) {
      merged.set(it.id_producto, (merged.get(it.id_producto) ?? 0) + Number(it.cantidad || 0));
    }
    const out = [...merged.entries()].map(([id_producto, cantidad]) => ({ id_producto, cantidad }));
    if (!out.length) throw new BadRequestException('Debes enviar al menos un producto');
    if (out.some((i) => !i.id_producto || i.cantidad <= 0)) throw new BadRequestException('Cantidad inválida');
    return out;
  }

  private async nextCodigo(manager: any) {
    let seq = await manager.findOne(MovimientoSeq, {
      where: {},
      lock: { mode: 'pessimistic_write' },
    });

    if (!seq) {
      const created = manager.create(MovimientoSeq, { last_seq: 0 });
      await manager.save(created);

      seq = await manager.findOne(MovimientoSeq, {
        where: { id: created.id },
        lock: { mode: 'pessimistic_write' },
      });
    }

    if (!seq) throw new Error('No se pudo inicializar el secuencial de movimientos');

    seq.last_seq += 1;
    await manager.save(seq);

    return formatMov(seq.last_seq);
  }

  private async findStockLocked(manager: any, id_producto: string, id_bodega: string) {
    return manager
      .getRepository(StockBodega)
      .createQueryBuilder('s')
      .setLock('pessimistic_write')
      .where('s.id_producto = :id_producto', { id_producto })
      .andWhere('s.id_bodega = :id_bodega', { id_bodega })
      .getOne();
  }

  /**
   * Entrada de inventario (incrementa stock en una bodega).
   * Útil para cargar stock inicial en Bodega Principal y luego transferir.
   */
  async createEntrada(dto: CreateEntradaDto, auth: { userId: string; role: string | null }) {
    if (!auth?.userId) throw new ForbiddenException('No autenticado');

    const role = this.normalizeRole(auth.role);
    const user = await this.usuarioService.findOne(auth.userId);
    const userBodega = (user as any).id_bodega ?? null;

    let idBodega = dto.id_bodega;
    if (role === 'BODEGA') {
      if (!userBodega) throw new BadRequestException('El usuario no tiene bodega asignada');
      idBodega = userBodega;
    }

    const items = this.mergeItems(dto.items as any);

    const bodega = await this.bodegaRepo.findOne({ where: { id_bodega: idBodega } });
    if (!bodega) throw new NotFoundException('Bodega no existe');

    return this.movRepo.manager.transaction(async (manager) => {
      const codigo = await this.nextCodigo(manager);

      const prodIds = items.map((i) => i.id_producto);
      const productos = await manager.findByIds(Producto, prodIds as any);
      if (productos.length !== prodIds.length) {
        throw new NotFoundException('Uno o más productos no existen');
      }

      const saldoByProducto = new Map<string, number>();

      for (const it of items) {
        let sb = await this.findStockLocked(manager, it.id_producto, idBodega);

        if (!sb) {
          await manager.save(
            manager.create(StockBodega, {
              id_producto: it.id_producto,
              id_bodega: idBodega,
              stock: 0,
            }),
          );

          sb = await this.findStockLocked(manager, it.id_producto, idBodega);
        }

        if (!sb) throw new Error('No se pudo inicializar stock');

        sb.stock += it.cantidad;
        await manager.save(sb);

        // mantener producto.stock_actual como TOTAL global
        await manager.increment(Producto, { id_producto: it.id_producto } as any, 'stock_actual', it.cantidad);

        saldoByProducto.set(it.id_producto, sb.stock);
      }

      const mov = manager.create(Movimiento, {
        codigo,
        id_bodega_origen: idBodega,
        id_bodega_destino: idBodega,
        id_usuario: auth.userId,
        fecha_movimiento: new Date(),
        observacion: dto.observacion ?? null,
        detalles: items.map((it) =>
          manager.create(MovimientoDetalle, {
            id_producto: it.id_producto,
            cantidad: it.cantidad,
          }),
        ),
      });

      const movGuardado = await manager.save(mov);

      // kardex: entrada por cada item
      for (const it of items) {
        await manager.save(
          manager.create(Kardex, {
            id_producto: it.id_producto,
            id_bodega: idBodega,
            id_usuario: auth.userId,
            fecha: new Date(),
            tipo: 'entrada',
            cantidad: it.cantidad,
            saldo: saldoByProducto.get(it.id_producto) ?? 0,
            descripcion: dto.observacion ?? `Entrada de inventario (${codigo})`,
            id_movimiento: movGuardado.id_movimiento,
          }),
        );
      }

      return {
        mensaje: 'Entrada registrada con éxito',
        movimiento: movGuardado,
      };
    });
  }

  /**
   * Transferencia entre bodegas (documento tipo SALIDA).
   * - ADMIN: puede indicar origen/destino
   * - BODEGA: origen se fuerza a la bodega del usuario
   */
  async createTransfer(dto: CreateMovimientoDto, auth: { userId: string; role: string | null }) {
    if (!auth?.userId) throw new ForbiddenException('No autenticado');

    if (dto.id_bodega_origen === dto.id_bodega_destino) {
      throw new BadRequestException('La bodega origen y destino no pueden ser la misma');
    }

    if (!dto.items?.length) throw new BadRequestException('Debes enviar al menos un producto');

    const items = this.mergeItems(dto.items as any);

    // obtener usuario (Mongo) para conocer su bodega
    const user = await this.usuarioService.findOne(auth.userId);
    const userBodega = (user as any).id_bodega ?? null;

    // si es BODEGA, forzamos origen = su bodega
    const role = this.normalizeRole(auth.role);
    let idOrigen = dto.id_bodega_origen;
    if (role === 'BODEGA') {
      if (!userBodega) throw new BadRequestException('El usuario no tiene bodega asignada');
      idOrigen = userBodega;
    }

    const idDestino = dto.id_bodega_destino;

    // validar bodegas existen
    const [b1, b2] = await Promise.all([
      this.bodegaRepo.findOne({ where: { id_bodega: idOrigen } }),
      this.bodegaRepo.findOne({ where: { id_bodega: idDestino } }),
    ]);
    if (!b1) throw new NotFoundException('Bodega origen no existe');
    if (!b2) throw new NotFoundException('Bodega destino no existe');

    // transacción para consistencia + locks
    return this.movRepo.manager.transaction(async (manager) => {
      const codigo = await this.nextCodigo(manager);


      // 2) validar productos existen
      const prodIds = items.map(i => i.id_producto);
      const productos = await manager.findByIds(Producto, prodIds as any);
      if (productos.length !== prodIds.length) {
        throw new NotFoundException('Uno o más productos no existen');
      }

      // 3) aplicar stock por bodega con locks
      const warnings: string[] = [];

      for (const it of items) {
        // lock stock origen
        let sOrigen = await this.findStockLocked(manager, it.id_producto, idOrigen);

        if (!sOrigen) {
          await manager.save(
            manager.create(StockBodega, {
              id_producto: it.id_producto,
              id_bodega: idOrigen,
              stock: 0,
            }),
          );

          sOrigen = await this.findStockLocked(manager, it.id_producto, idOrigen);
        }

        if (!sOrigen) throw new Error('No se pudo inicializar stock origen');

        if (Number(sOrigen.stock) < Number(it.cantidad)) {
          throw new BadRequestException(
            `Stock insuficiente en la bodega origen para el producto ${it.id_producto}. Disponible: ${sOrigen.stock}, solicitado: ${it.cantidad}`,
          );
        }


        // lock stock destino
        let sDestino = await this.findStockLocked(manager, it.id_producto, idDestino);

        if (!sDestino) {
          await manager.save(
            manager.create(StockBodega, {
              id_producto: it.id_producto,
              id_bodega: idDestino,
              stock: 0,
            }),
          );

          sDestino = await this.findStockLocked(manager, it.id_producto, idDestino);
        }

        if (!sDestino) throw new Error('No se pudo inicializar stock destino');


        // aplicar transferencia: salida origen, entrada destino
        sOrigen.stock -= it.cantidad;
        sDestino.stock += it.cantidad;

        await manager.save([sOrigen, sDestino]);

        // warning si stock bajo en origen
        if (sOrigen.stock < 5) {
          warnings.push(`Stock bajo (<5) en origen para producto ${it.id_producto}. Queda: ${sOrigen.stock}`);
        }
      }

      // 4) guardar movimiento + detalles
      const mov = manager.create(Movimiento, {
        codigo,
        id_bodega_origen: idOrigen,
        id_bodega_destino: idDestino,
        id_usuario: auth.userId,
        fecha_movimiento: new Date(),
        observacion: dto.observacion ?? null,
        detalles: items.map(it =>
          manager.create(MovimientoDetalle, {
            id_producto: it.id_producto,
            cantidad: it.cantidad,
          }),
        ),
      });

      const movGuardado = await manager.save(mov);

      // 5) kardex: registramos salida en origen y entrada en destino por cada item
      for (const it of items) {
        const sOrigen = await manager.findOne(StockBodega, {
          where: { id_producto: it.id_producto, id_bodega: idOrigen },
        });
        const sDestino = await manager.findOne(StockBodega, {
          where: { id_producto: it.id_producto, id_bodega: idDestino },
        });

        // salida origen
        await manager.save(
          manager.create(Kardex, {
            id_producto: it.id_producto,
            id_bodega: idOrigen,
            id_usuario: auth.userId,
            fecha: new Date(),
            tipo: 'salida',
            cantidad: it.cantidad,
            saldo: sOrigen?.stock ?? 0,
            descripcion: dto.observacion ?? `Transferencia a ${b2.nombre}`,
            id_movimiento: movGuardado.id_movimiento,
          }),
        );

        // entrada destino (para trazabilidad)
        await manager.save(
          manager.create(Kardex, {
            id_producto: it.id_producto,
            id_bodega: idDestino,
            id_usuario: auth.userId,
            fecha: new Date(),
            tipo: 'entrada',
            cantidad: it.cantidad,
            saldo: sDestino?.stock ?? 0,
            descripcion: dto.observacion ?? `Transferencia desde ${b1.nombre}`,
            id_movimiento: movGuardado.id_movimiento,
          }),
        );
      }

      return {
        mensaje: 'Movimiento registrado con éxito',
        movimiento: movGuardado,
        warnings,
      };
    });
  }
}
