import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { Cart } from 'src/cart/entities/cart.entity';

@Module({
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([User, Cart]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'), //pegar senha do .env
        signOptions: { expiresIn: '4h' }, //pode ser duração que deseja pra o token expirar
      }),
    }),
    PassportModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, JwtModule, AuthService]
})
export class AuthModule {}
