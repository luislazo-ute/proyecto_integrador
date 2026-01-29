import { Transform, Type } from 'class-transformer';
import { IsUUID, IsInt, Min, IsOptional, IsString } from 'class-validator';
const emptyToUndefined = ({ value }: {
    value: unknown;
}) => value === '' ? undefined : value;
export class AddDetalleRutaDto {
    @Transform(emptyToUndefined)
    @IsUUID()
    id_ruta: string;
    @Transform(emptyToUndefined)
    @IsOptional()
    @IsUUID()
    id_bodega_origen?: string;
    @Transform(emptyToUndefined)
    @IsOptional()
    @IsUUID()
    id_bodega_destino?: string;
    @Transform(emptyToUndefined)
    @IsOptional()
    @IsUUID()
    id_producto?: string;
    @Transform(emptyToUndefined)
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    cantidad?: number;
    @Transform(emptyToUndefined)
    @IsOptional()
    @IsString()
    direccion_entrega?: string;
    @Transform(emptyToUndefined)
    @IsOptional()
    @IsString()
    destinatario?: string;
    @Transform(emptyToUndefined)
    @IsOptional()
    @IsString()
    telefono?: string;
}
