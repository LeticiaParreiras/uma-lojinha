
import { BadRequestException, Injectable } from '@nestjs/common';
import { ResgisterDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

  ) {}
  async register(dto: ResgisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      return new BadRequestException('Email already in use');
    }
    // salt e hash da senha
    const salt = randomBytes(8).toString('hex');
    const hash = await scrypt(dto.password, salt, 32) as Buffer;
    const saltedHash = salt + '.' + hash.toString('hex');

    const user = this.userRepository.create({
    username: dto.username,
    email: dto.email,
    password: saltedHash,
    });
    await this.userRepository.save(user);
    // escodendo a senha no retorno
    const { password: _, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      return new BadRequestException('Credenciais inválidas');
    }
    // verificando a senha
    const [salt, storedHash] = user.password.split('.'); 
    const hash = (await scrypt(dto.password, salt, 32)) as Buffer; 
    if (storedHash !== hash.toString('hex')) {
      return new BadRequestException('Credenciais inválidas');
    }
    const { password: _, ...result } = user;
    return result;
  }
}
