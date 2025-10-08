import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResgisterDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

@Post('/register')
register(@Body() ResgisterDto: ResgisterDto) {
  return this.authService.register(ResgisterDto);
}
@Post('/login')
login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
}