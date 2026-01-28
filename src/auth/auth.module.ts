import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsuarioModule } from '../modules/usuario/usuario.module';

@Module({
  imports: [
    UsuarioModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret =
          config.get<string>('JWT_SECRET') ??
          config.get<string>('SECRET_KEY') ??
          '';

        if (!secret) {
          throw new Error(
            'Falta JWT_SECRET (o SECRET_KEY) en el entorno/.env para firmar JWT',
          );
        }

        const expiresIn = Number(config.get<string>('JWT_EXPIRES_IN')) || 3600;

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
