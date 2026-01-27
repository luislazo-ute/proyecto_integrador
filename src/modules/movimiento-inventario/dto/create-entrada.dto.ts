import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EntradaItemDto {
  @IsUUID()
  id_producto: string;

  @IsNumber()
  @Min(1)
  cantidad: number;
}

export class CreateEntradaDto {
  @IsUUID()
  @IsNotEmpty()
  id_bodega: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EntradaItemDto)
  items: EntradaItemDto[];

  @IsOptional()
  @IsString()
  observacion?: string;
}
