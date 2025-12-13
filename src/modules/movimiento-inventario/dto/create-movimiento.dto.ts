import { IsUUID, IsString, IsNotEmpty, IsNumber, IsIn } from 'class-validator';

export class CreateMovimientoDto {
  @IsUUID()
  id_producto: string;

  @IsUUID()
  id_bodega: string;

  @IsIn(['entrada', 'salida'])
  tipo_movimiento: 'entrada' | 'salida';

  @IsNumber()
  cantidad: number;

  @IsString()
  @IsNotEmpty()
  id_usuario: string;

  @IsString()
  observacion?: string;
}
