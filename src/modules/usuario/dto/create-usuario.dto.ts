import { IsNotEmpty, IsString, IsBoolean, IsUUID } from 'class-validator';

export class CreateUsuarioDto {
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
  email?: string;

  @IsString()
  telefono?: string;

  @IsUUID()
  @IsNotEmpty()
  id_rol: string; // UUID del rol

  @IsBoolean()
  estado?: boolean;
}
