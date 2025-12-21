import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { Producto } from 'src/modules/producto/entities/producto.entity';
import { Kardex } from 'src/modules/kardex/entities/kardex.entity';

@Injectable()
export class MovimientoInventarioService {
  constructor(
    @InjectRepository(MovimientoInventario)
    private readonly movimientoRepo: Repository<MovimientoInventario>,

    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,

    @InjectRepository(Kardex)
    private readonly kardexRepo: Repository<Kardex>,
  ) {}

  async create(dto: CreateMovimientoDto) {
    const producto = await this.productoRepo.findOne({
      where: { id_producto: dto.id_producto },
    });

    if (!producto) throw new NotFoundException('Producto no encontrado');

    if (
      dto.tipo_movimiento === 'salida' &&
      producto.stock_actual < dto.cantidad
    ) {
      throw new BadRequestException(
        'Stock insuficiente para realizar la salida',
      );
    }

    producto.stock_actual =
      dto.tipo_movimiento === 'entrada'
        ? producto.stock_actual + dto.cantidad
        : producto.stock_actual - dto.cantidad;

    await this.productoRepo.save(producto);

    const movimiento = this.movimientoRepo.create({
      ...dto,
      fecha_movimiento: new Date(),
    });
    const movimientoGuardado = await this.movimientoRepo.save(movimiento);

    const kardex = this.kardexRepo.create({
      id_producto: dto.id_producto,
      fecha: new Date(),
      tipo: dto.tipo_movimiento,
      cantidad: dto.cantidad,
      saldo: producto.stock_actual,
      descripcion: dto.observacion,
      id_movimiento: movimientoGuardado.id_movimiento,
    });

    await this.kardexRepo.save(kardex);

    return {
      mensaje: 'Movimiento registrado con éxito',
      movimiento: movimientoGuardado,
      stock_actual: producto.stock_actual,
    };
  }

  async findAll() {
    return await this.movimientoRepo.find();
  }
}
