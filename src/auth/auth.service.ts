import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from 'src/modules/usuario/usuario.service';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.usuarioService.findByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const userId =
      (user as any)?._id ??
      (user as any)?.id ??
      (user as any)?.userId ??
      (user as any)?.username;

    const payload = {
      sub: String(userId),
      username: user.username,
      rol: (user as any).id_rol?.nombre ?? null,   // ✅ ya viene por populate
      id_bodega: (user as any).id_bodega ?? null, // ✅ para default en front
    };

    return { access_token: this.jwtService.sign(payload) };
  }
}
