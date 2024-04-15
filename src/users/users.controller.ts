import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Auth(Role.USER)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll(@ActiveUser() activeUser: IActiveUser) {
        return this.usersService.findAll(activeUser);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.usersService.findOne(id);
    }

    @Auth(Role.ADMIN)
    @Get(':id/withDeleted')
    findOneWithDeleted(@Param('id') id: number) {
        return this.usersService.findOneWithDeleted(id);
    }

    @Patch(':id')
    update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @ActiveUser() activeUser: IActiveUser) {
        return this.usersService.update(id, updateUserDto);
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
        return this.usersService.removeSoft(id);
    }
}
