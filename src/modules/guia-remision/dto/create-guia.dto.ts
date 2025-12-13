import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CreateGuiaDto {
  @IsString()
  @IsNotEmpty()
  numero_guia: string;

  @IsUUID()
  id_ruta: string;

  @IsUUID()
  id_transporte: string;

  @IsUUID()
  id_conductor: string;

  @IsString()
  punto_partida: string;

  @IsString()
  punto_llegada: string;

  @IsString()
  motivo_traslado: string;
}
