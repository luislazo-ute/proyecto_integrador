import { IsUUID, IsInt, IsString, Min, IsOptional } from 'class-validator';

export class AddDetalleGuiaDto {
  @IsUUID()
  id_guia: string;

  @IsUUID()
  id_producto: string;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsOptional()
  @IsString()
  observacion?: string;
}
