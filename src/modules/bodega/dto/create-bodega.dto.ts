import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
  Matches,
} from 'class-validator';

const RESPONSABLE_RE = /^(?:[a-f\d]{24}|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;

export class CreateBodegaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  ubicacion: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @ValidateIf((_, value) => value !== null && value !== undefined && value !== '')
  @Matches(RESPONSABLE_RE, {
    message: 'responsable must be a mongodb id or uuid',
  })
  responsable?: string | null;
}
