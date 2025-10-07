import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
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
  async register (createAuthDto: CreateAuthDto) {
    const existingUser = await this.userRepository.findOne({where: {email: createAuthDto.email}});
    if( existingUser) {
      return new BadRequestException('Email already in use');
  }
  // salt e hash da senha
  const salt = randomBytes(8).toString('hex');
  const hash = await scrypt(createAuthDto.password, salt, 32) as Buffer;
  const saltedHash = salt + '.' + hash.toString('hex');

  const user = this.userRepository.create({
    username: createAuthDto.username,
    email: createAuthDto.email,
    password: saltedHash,
  });
  await this.userRepository.save(user);
  // escodendo a senha no retorno
    const {password, ...result} = user;
    return result;
  }
}
