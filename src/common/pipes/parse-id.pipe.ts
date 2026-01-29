import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
const MONGO_OBJECT_ID_RE = /^[a-f\d]{24}$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
@Injectable()
export class ParseIdPipe implements PipeTransform<string> {
    transform(value: string) {
        const v = String(value ?? '').trim();
        if (!v)
            throw new BadRequestException('id requerido');
        if (MONGO_OBJECT_ID_RE.test(v) || UUID_RE.test(v))
            return v;
        throw new BadRequestException('id inválido');
    }
}
