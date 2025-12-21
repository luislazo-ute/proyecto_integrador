import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../modules/usuario/usuario.service';

type RolLike = { nombre: string };

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

    const rolNombre = (() => {
      const idRol = user.id_rol;
      if (typeof idRol === 'string') return idRol;
      if (idRol && typeof idRol === 'object' && 'nombre' in idRol) {
        return (idRol as RolLike).nombre;
      }
      return null;
    })();

    const payload = {
      sub: user._id,
      username: user.username,
      rol: rolNombre,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
