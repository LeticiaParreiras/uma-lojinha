import { Controller, Get, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('BearerAuth')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findOne(@CurrentUser() user: CurrentUserDto) {
    return this.userService.findOne(user);
  }

}
