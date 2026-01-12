
import { BadRequestException, Injectable } from '@nestjs/common';
import { ResgisterDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { Cart } from 'src/cart/entities/cart.entity';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private  userRepository: Repository<User>,
    private readonly JwtService: JwtService,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}
  async register(dto: ResgisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email invalid');
    }
    // salt e hash da senha
    const salt = randomBytes(8).toString('hex');
    const hash = await scrypt(dto.password, salt, 32) as Buffer;
    const saltedHash = salt + '.' + hash.toString('hex');

    //criando usuario
    const user = this.userRepository.create({
    username: dto.username,
    email: dto.email,
    password: saltedHash,
    });
     await this.userRepository.save(user);

    // criando carrinho
    const cart = this.cartRepository.create({
      user : user,
      CartItems: []
    })
    await this.cartRepository.save(cart)
    // escodendo a senha no retorno
    const { password: _, ...result } = user;
    return result;
  }
  async crateAdminUser(dto: ResgisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email invalid');
    }
    // salt e hash da senha
    const salt = randomBytes(8).toString('hex');
    const hash = await scrypt(dto.password, salt, 32) as Buffer;
    const saltedHash = salt + '.' + hash.toString('hex');

    //criando usuario
    const user = this.userRepository.create({
    username: dto.username,
    email: dto.email,
    password: saltedHash,
    role: UserRole.ADMIN,
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
      throw new BadRequestException('Credenciais inválidas');
    }
    // verificando a senha
    const [salt, storedHash] = user.password.split('.'); 
    const hash = (await scrypt(dto.password, salt, 32)) as Buffer; 
    if (storedHash !== hash.toString('hex')) {
      return new BadRequestException('Credenciais inválidas');
    }
    const payload = {username: user.username, sub: user.id, role: user.role}

    return {accessToken: this.JwtService.sign(payload)}
  }
}
