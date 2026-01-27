import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockBodega } from './entities/stock-bodega.entity';
import { UsuarioService } from 'src/modules/usuario/usuario.service';

@Injectable()
export class StockBodegaService {
  constructor(
    @InjectRepository(StockBodega)
    private readonly stockRepo: Repository<StockBodega>,
    private readonly usuarioService: UsuarioService,
  ) {}

  private normalizeRole(raw: any): string {
    return String(raw ?? '').toUpperCase().trim();
  }

  private async assertCanReadBodega(auth: { userId: string; role: string | null }, id_bodega: string) {
    if (!auth?.userId) throw new ForbiddenException('No autenticado');
    if (this.normalizeRole(auth.role) !== 'BODEGA') return;

    const user = await this.usuarioService.findOne(auth.userId);
    const userBodega = (user as any).id_bodega ?? null;
    if (!userBodega || userBodega !== id_bodega) {
      throw new ForbiddenException('No puedes consultar el stock de otra bodega');
    }
  }

  async findByBodega(id_bodega: string, auth: { userId: string; role: string | null }) {
    await this.assertCanReadBodega(auth, id_bodega);

    const rows = await this.stockRepo.find({
      where: { id_bodega },
      order: { id_producto: 'ASC' as any },
      select: ['id_producto', 'stock'],
    });

    return rows.map((r) => ({ id_producto: r.id_producto, stock: Number(r.stock ?? 0) }));
  }
}
