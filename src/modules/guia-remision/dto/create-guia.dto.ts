import { IsUUID, IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateGuiaDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    numero_guia?: string;
    @IsUUID()
    id_ruta: string;
    @IsUUID()
    id_transporte: string;
    @IsUUID()
    id_conductor: string;
    @IsUUID()
    id_usuario_encargado: string;
    @IsString()
    punto_partida: string;
    @IsString()
    punto_llegada: string;
    @IsString()
    motivo_traslado: string;
}
