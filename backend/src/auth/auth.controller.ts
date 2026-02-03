import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResgisterDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

@Post('/register')
@ApiOperation({
  summary:'Register User',
  description: 'User registration'
})
register(@Body() ResgisterDto: ResgisterDto) {
  return this.authService.register(ResgisterDto);
}
@Post('/admin/register')
@ApiOperation({
  summary: 'Register Admin',
  description: 'Admin user registration'
})
crateAdminUser(@Body() ResgisterDto: ResgisterDto) {
  return this.authService.crateAdminUser(ResgisterDto);
}
@Post('/login')
@ApiOperation({
  summary:'Login'
})
async login(@Body() loginDto: LoginDto) {
  return await this.authService.login(loginDto);

}
}