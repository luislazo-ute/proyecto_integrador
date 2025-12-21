import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateBodegaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  ubicacion: string;

  @IsOptional()
  @IsUUID()
  responsable?: string;
}
