import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      // aqui diz que o token vai estar no cabeçalho de request como bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // e para rejeitar token expirado
      ignoreExpiration: false,
    });
  }
  validate(payload: any) {
    //serve para aplicar uma validação adicional se precisar
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
