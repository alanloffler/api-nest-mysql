import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { Role } from '../common/enums/role.enum';
import { UpdateCityDto } from './dto/update-city.dto';

@Auth(Role.ADMIN)
@Controller('cities')
export class CitiesController {
    constructor(private readonly citiesService: CitiesService) {}

    @Post()
    create(@Body() createCityDto: CreateCityDto) {
        return this.citiesService.create(createCityDto);
    }

    @Get()
    findAll() {
        return this.citiesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.citiesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateCityDto: UpdateCityDto) {
        return this.citiesService.update(id, updateCityDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.citiesService.remove(id);
    }

    @Delete(':id/soft')
    removeSoft(@Param('id', ParseIntPipe) id: number) {
        return this.citiesService.removeSoft(id);
    }

    @Patch(':id/restore')
    restore(@Param('id', ParseIntPipe) id: number) {
        return this.citiesService.restore(id);
    }
}
