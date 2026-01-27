import { IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class FilterGuiaDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  numero?: string;

  @IsOptional()
  @IsIn(['emitida', 'en transito', 'finalizada'])
  estado?: 'emitida' | 'en transito' | 'finalizada';

  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;
}
