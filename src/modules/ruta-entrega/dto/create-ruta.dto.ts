import { IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';

export class CreateRutaDto {
  // Compatibilidad con frontend actual
  @IsOptional()
  @IsString()
  nombre_ruta?: string;

  @IsOptional()
  @IsDateString()
  fecha_programada?: string;

  @IsOptional()
  @IsUUID()
  id_bodega?: string;

  // Campos actuales en BD
  @IsOptional()
  @IsString()
  origen?: string;

  @IsOptional()
  @IsString()
  destino?: string;

  @IsOptional()
  @IsDateString()
  fecha_salida?: string;

  @IsOptional()
  @IsDateString()
  fecha_llegada?: string;

  @IsOptional()
  @IsUUID()
  id_transporte?: string;

  @IsOptional()
  @IsUUID()
  id_conductor?: string;

  @IsOptional()
  @IsUUID()
  id_usuario_encargado?: string;
}
