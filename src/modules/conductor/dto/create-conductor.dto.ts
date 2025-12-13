import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateConductorDto {
  @IsString() @IsNotEmpty() nombre: string;
  @IsString() @IsNotEmpty() cedula: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() licencia?: string;
  @IsOptional() estado?: boolean;
}
