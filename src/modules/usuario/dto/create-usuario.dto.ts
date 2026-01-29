import { IsNotEmpty, IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
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
    @IsOptional()
    email?: string;
    @IsString()
    @IsOptional()
    telefono?: string;
    @IsString()
    @IsNotEmpty()
    id_rol: string;
    @IsBoolean()
    @IsOptional()
    estado?: boolean;
    @IsUUID()
    @IsOptional()
    id_bodega?: string;
}
