import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateProductoDto {
  @IsUUID()
  @IsNotEmpty()
  id_categoria: string;

  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  precio_compra: number;

  @IsNumber()
  precio_venta: number;

  @IsNumber()
  stock_actual: number;

  @IsNumber()
  peso: number;

  @IsString()
  tipo_unidad: string;

  @IsString()
  unidad_embalaje: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
