import { IsUUID, IsInt, Min } from 'class-validator';

export class AddDetalleRutaDto {
  @IsUUID() id_ruta: string;
  @IsUUID() id_bodega_origen: string;
  @IsUUID() id_bodega_destino: string;
  @IsUUID() id_producto: string;
  @IsInt() @Min(1) cantidad: number;
}
