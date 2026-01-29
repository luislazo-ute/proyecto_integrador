import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateTransporteDto {
    @IsString()
    @IsNotEmpty()
    placa: string;
    @IsString()
    @IsNotEmpty()
    tipo_vehiculo: string;
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    capacidad: number;
    @IsOptional()
    @IsString()
    estado?: string;
}
