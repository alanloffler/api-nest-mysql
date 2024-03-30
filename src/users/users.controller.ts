import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/role.enum';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { Roles } from '../auth/decorators/roles.decorator';

@Auth(Role.USER)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles(Role.ADMIN)
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number, @ActiveUser() activeUser: IActiveUser) {
        return this.usersService.findOne(id, activeUser);
    }

    @Patch(':id')
    update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @ActiveUser() activeUser: IActiveUser) {
        return this.usersService.update(id, updateUserDto, activeUser);
    }

    @Patch(':id/restore')
    @Roles(Role.ADMIN)
    restore(@Param('id') id: number) {
        return this.usersService.restore(id);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: number) {
        return this.usersService.remove(id);
    }

    @Delete(':id/soft')
    removeSoft(@Param('id') id: number, @ActiveUser() activeUser: IActiveUser) {
        return this.usersService.removeSoft(id, activeUser);
    }
}