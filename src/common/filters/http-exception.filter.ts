import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, } from '@nestjs/common';
import type { Request, Response } from 'express';
@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const pgCode = exception && typeof exception === 'object'
            ? ((exception as any).code ?? (exception as any).driverError?.code)
            : undefined;
        if (pgCode === '23503') {
            response.status(HttpStatus.CONFLICT).json({
                statusCode: HttpStatus.CONFLICT,
                message: 'No se puede completar la operación porque existen registros asociados (dependencias). ' +
                    'Primero elimina o actualiza esos registros.',
                timestamp: new Date().toISOString(),
                path: request.url,
            });
            return;
        }
        const extractMessage = (raw: unknown): string => {
            if (typeof raw === 'string')
                return raw;
            if (raw && typeof raw === 'object') {
                const msg = (raw as any).message;
                if (typeof msg === 'string')
                    return msg;
                if (Array.isArray(msg)) {
                    const parts = msg.filter((x) => typeof x === 'string' && x.trim().length > 0);
                    if (parts.length)
                        return parts.join('; ');
                }
                if (typeof (raw as any).error === 'string')
                    return (raw as any).error;
            }
            return 'Internal server error';
        };
        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = (() => {
            if (exception instanceof HttpException) {
                return extractMessage(exception.getResponse());
            }
            if (exception && typeof exception === 'object' && 'message' in exception) {
                return extractMessage((exception as {
                    message?: unknown;
                }).message);
            }
            return 'Internal server error';
        })();
        response.status(status).json({
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
