import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateStateDto } from './dto/create-state.dto';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { StatesService } from './states.service';
import { UpdateStateDto } from './dto/update-state.dto';

@Auth(Role.ADMIN)
@Controller('states')
export class StatesController {
    constructor(private readonly statesService: StatesService) {}

    @Post()
    create(@Body() createStateDto: CreateStateDto) {
        return this.statesService.create(createStateDto);
    }

    @Roles(Role.USER)
    @Get()
    findAll() {
        return this.statesService.findAll();
    }

    @Get()
    findAllAdmin() {
        return this.statesService.findAllAdmin();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.statesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateStateDto: UpdateStateDto) {
        return this.statesService.update(id, updateStateDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.statesService.remove(id);
    }

    @Delete(':id/soft')
    removeSoft(@Param('id', ParseIntPipe) id: number) {
        return this.statesService.removeSoft(id);
    }

    @Patch(':id/restore')
    restore(@Param('id', ParseIntPipe) id: number) {
        return this.statesService.restore(id);
    }
}
