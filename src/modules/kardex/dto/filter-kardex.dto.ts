import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';

export class FilterKardexDto {
  @IsOptional()
  @IsUUID()
  id_producto?: string;

  @IsOptional()
  @IsUUID()
  id_bodega?: string;

  @IsOptional()
  @IsIn(['entrada', 'salida'])
  tipo?: 'entrada' | 'salida';

  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;
}
