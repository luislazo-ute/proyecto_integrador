import { IsIn, IsOptional, IsString, IsUUID, IsDateString, MaxLength } from 'class-validator';

export class FilterMovimientoDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  codigo?: string;

  @IsOptional()
  @IsUUID()
  id_bodega_origen?: string;

  @IsOptional()
  @IsUUID()
  id_bodega_destino?: string;

  /**
   * Filtra por tipo lógico:
   * - entrada: origen == destino
   * - transferencia: origen != destino
   */
  @IsOptional()
  @IsIn(['entrada', 'transferencia'])
  tipo?: 'entrada' | 'transferencia';

  @IsOptional()
  @IsUUID()
  id_producto?: string;

  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;
}
