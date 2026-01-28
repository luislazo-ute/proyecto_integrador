import { IsUUID } from 'class-validator';

export class ImportMovimientoDto {
  @IsUUID()
  id_movimiento: string;
}
