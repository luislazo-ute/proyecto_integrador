// src/modules/usuario/dto/create-usuario.dto.ts
import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateUsuarioDto {
  @IsNumber()
  id_rol: number;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  telefono: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
