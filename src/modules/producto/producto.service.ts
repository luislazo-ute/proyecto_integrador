import { Injectable, ConflictException, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Categoria } from 'src/modules/categoria/entities/categoria.entity';
import { ProductoCodigoSeq } from './entities/producto_codigo_seq.entity';
import { BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from 'src/modules/usuario/schemas/usuario.schema';
import { StockBodega } from 'src/modules/stock-bodega/entities/stock-bodega.entity';
import { Bodega } from 'src/modules/bodega/entities/bodega.entity';
function normalizePrefix(text: string) {
    const cleaned = (text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase();
    const prefix = cleaned.slice(0, 3);
    return prefix.padEnd(3, 'X');
}
function formatCode(prefix: string, n: number) {
    return `${prefix}-${String(n).padStart(4, '0')}`;
}
@Injectable()
export class ProductoService {
    constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>, 
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>, 
    @InjectRepository(ProductoCodigoSeq)
    private readonly seqRepository: Repository<ProductoCodigoSeq>, 
    @InjectRepository(StockBodega)
    private readonly stockBodegaRepo: Repository<StockBodega>, 
    @InjectRepository(Bodega)
    private readonly bodegaRepo: Repository<Bodega>, 
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<Usuario>) { }
    async findAll() {
        return await this.productoRepository.find();
    }
    async findOne(id: string) {
        const producto = await this.productoRepository.findOne({
            where: { id_producto: id },
        });
        if (!producto) {
            throw new NotFoundException(`El producto con id ${id} no existe.`);
        }
        return producto;
    }
    private async nextCodigoForCategoria(manager: any, id_categoria: string) {
        const categoria = await manager.findOne(Categoria, {
            where: { id_categoria },
        });
        if (!categoria) {
            throw new NotFoundException(`La categoría con id ${id_categoria} no existe.`);
        }
        const prefix = normalizePrefix((categoria as any).nombre);
        let seq = await manager.findOne(ProductoCodigoSeq, {
            where: { id_categoria },
            lock: { mode: 'pessimistic_write' },
        });
        if (!seq) {
            seq = manager.create(ProductoCodigoSeq, { id_categoria, last_seq: 0 });
            await manager.save(seq);
            seq = await manager.findOne(ProductoCodigoSeq, {
                where: { id_categoria },
                lock: { mode: 'pessimistic_write' },
            });
        }
        seq.last_seq += 1;
        await manager.save(seq);
        return formatCode(prefix, seq.last_seq);
    }
    async create(data: CreateProductoDto, imagePath?: string, userId?: string) {
        if (!userId)
            throw new BadRequestException('No se pudo identificar el usuario');
        const user = await this.usuarioModel.findById(userId).lean();
        if (!user)
            throw new NotFoundException('Usuario no encontrado');
        return await this.productoRepository.manager.transaction(async (manager) => {
            const principal = await manager.findOne(Bodega, { where: { nombre: 'Bodega Principal' } });
            if (!principal)
                throw new NotFoundException('Bodega Principal no existe (ejecuta el seed inicial)');
            const codigo = await this.nextCodigoForCategoria(manager, data.id_categoria);
            const producto = manager.create(Producto, {
                ...data,
                codigo,
                imagen: imagePath || null,
            });
            const saved = await manager.save(producto);
            const initialStock = Number(data.stock_actual ?? 0);
            const id_bodega = principal.id_bodega;
            const existing = await manager.findOne(StockBodega, {
                where: { id_bodega, id_producto: saved.id_producto },
            });
            if (!existing) {
                const sb = manager.create(StockBodega, {
                    id_bodega,
                    id_producto: saved.id_producto,
                    stock: initialStock,
                });
                await manager.save(sb);
            }
            else {
                existing.stock += initialStock;
                await manager.save(existing);
            }
            return saved;
        });
    }
    async update(id: string, data: UpdateProductoDto, imagePath?: string) {
        return await this.productoRepository.manager.transaction(async (manager) => {
            const producto = await manager.findOne(Producto, {
                where: { id_producto: id },
            });
            if (!producto) {
                throw new NotFoundException(`El producto con id ${id} no existe.`);
            }
            if (imagePath)
                (producto as any).imagen = imagePath;
            if (data.id_categoria && data.id_categoria !== (producto as any).id_categoria) {
                (producto as any).codigo = await this.nextCodigoForCategoria(manager, data.id_categoria);
            }
            delete (data as any).stock_actual;
            delete (data as any).codigo;
            Object.assign(producto, data);
            return await manager.save(producto);
        });
    }
    async remove(id: string) {
        const producto = await this.findOne(id);
        const stockRows = await this.stockBodegaRepo.find({ where: { id_producto: producto.id_producto } });
        if (stockRows.length > 0) {
            const bodegaNameById = new Map<string, string>();
            for (const row of stockRows) {
                const name = (row as any)?.bodega?.nombre;
                bodegaNameById.set(row.id_bodega, typeof name === 'string' && name.trim() ? name.trim() : row.id_bodega);
            }
            const bodegas = Array.from(bodegaNameById.values());
            const bodegasPreview = bodegas.slice(0, 3).join(', ');
            const suffix = bodegas.length > 3 ? `, y ${bodegas.length - 3} más` : '';
            const label = `${producto.nombre} (${producto.codigo})`;
            throw new ConflictException(`No se puede eliminar el producto "${label}" porque tiene stock registrado en ${bodegas.length} bodega(s). ` +
                (bodegas.length ? `Bodegas: ${bodegasPreview}${suffix}. ` : '') +
                'Primero elimina/ajusta ese stock (o desactiva el producto).');
        }
        try {
            return await this.productoRepository.remove(producto);
        }
        catch (e: any) {
            if (e?.code === '23503') {
                throw new ConflictException('No se puede eliminar el producto porque está siendo usado en otros registros. ' +
                    'Revisa dependencias (stock, movimientos, rutas, etc.).');
            }
            throw e;
        }
    }
}
