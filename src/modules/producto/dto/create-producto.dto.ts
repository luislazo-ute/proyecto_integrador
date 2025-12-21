import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
  @Type(() => Number)
  precio_compra: number;

  @IsNumber()
  @Type(() => Number)
  precio_venta: number;

  @IsNumber()
  @Type(() => Number)
  stock_actual: number;

  @IsNumber()
  @Type(() => Number)
  peso: number;

  @IsString()
  tipo_unidad: string;

  @IsString()
  unidad_embalaje: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
    return undefined;
  })
  estado?: boolean;
}
