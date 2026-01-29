import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    const port = Number(process.env.PORT) || 3000;
    try {
        await app.listen(port);
        console.log(`🚀 Server running on port ${port}`);
    }
    catch (e: any) {
        if (e?.code === 'EADDRINUSE') {
            console.error(`❌ El puerto ${port} ya está en uso (EADDRINUSE).`);
            console.error('✅ Soluciones rápidas:');
            console.error('  - Cierra el proceso que está usando el puerto.');
            console.error('  - O ejecuta: npm run start:dev:free (libera el 3000 y arranca).');
            console.error('  - O cambia el puerto:');
            console.error('      PowerShell: $env:PORT=3001; npm run start:dev');
            console.error('      CMD: set PORT=3001 && npm run start:dev');
            return;
        }
        throw e;
    }
}
void bootstrap();
