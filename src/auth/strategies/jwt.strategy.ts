import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
type JwtPayload = {
    sub: string;
    username: string;
    rol?: string | null;
    iat?: number;
    exp?: number;
};
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly config: ConfigService) {
        const secret = config.get<string>('JWT_SECRET') ??
            config.get<string>('SECRET_KEY') ??
            '';
        if (!secret) {
            throw new Error('Falta JWT_SECRET (o SECRET_KEY) en el entorno/.env para validar JWT');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
    }
    validate(payload: JwtPayload): JwtPayload {
        return payload;
    }
}
