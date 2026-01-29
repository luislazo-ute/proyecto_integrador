import { PipeTransform, Injectable } from '@nestjs/common';
@Injectable()
export class PaginationPipe implements PipeTransform {
    transform(value: unknown) {
        const v = (value ?? {}) as Record<string, unknown>;
        return {
            page: Number(v.page) || 1,
            limit: Number(v.limit) || 10,
        };
    }
}
