import { IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';

export class CreateRutaDto {
  @IsString() origen: string;
  @IsString() destino: string;
  @IsOptional() @IsDateString() fecha_salida?: string;
  @IsOptional() @IsDateString() fecha_llegada?: string;
  @IsOptional() @IsUUID() id_transporte?: string;
  @IsOptional() @IsUUID() id_conductor?: string;
  @IsOptional() @IsUUID() id_usuario_encargado?: string;
}
