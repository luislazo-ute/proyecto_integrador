import { IsUUID, IsNotEmpty, IsNumber, Min, ValidateNested, IsArray, ArrayMinSize, IsOptional, IsString, IsIn, } from 'class-validator';
import { Type } from 'class-transformer';
export class MovimientoItemDto {
    @IsUUID()
    id_producto: string;
    @IsNumber()
    @Min(1)
    cantidad: number;
}
export class CreateMovimientoDto {
    @IsUUID()
    @IsNotEmpty()
    id_bodega_origen: string;
    @IsUUID()
    @IsNotEmpty()
    id_bodega_destino: string;
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => MovimientoItemDto)
    items: MovimientoItemDto[];
    @IsOptional()
    @IsIn(['salida'])
    tipo_movimiento?: 'salida';
    @IsOptional()
    @IsString()
    observacion?: string;
}
