import { IsUUID, IsString, IsNotEmpty, IsNumber, IsIn, IsInt, IsPositive, IsOptional } from 'class-validator';

export class CreateMovimientoDto {
  @IsUUID()
  id_producto: string;

  @IsUUID()
  id_bodega: string;

  @IsIn(['entrada', 'salida'])
  tipo_movimiento: 'entrada' | 'salida';

  @IsInt()
  @IsPositive()
  cantidad: number;

  @IsInt()
  @IsPositive()
  id_usuario: number;

  @IsOptional()
  @IsString()
  observacion?: string;
}
