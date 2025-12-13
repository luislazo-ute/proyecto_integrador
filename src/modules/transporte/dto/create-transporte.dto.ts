import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateTransporteDto {
  @IsString() @IsNotEmpty() placa: string;
  @IsString() @IsNotEmpty() tipo_vehiculo: string;
  @IsNumber() capacidad: number;
  @IsOptional() @IsString() estado?: string;
}
