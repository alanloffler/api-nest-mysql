import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesService } from './roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';

@Auth(Role.ADMIN)
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Post()
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @Roles(Role.USER)
    @Get()
    findAll() {
        return this.rolesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
        return this.rolesService.update(id, updateRoleDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.remove(id);
    }
}
