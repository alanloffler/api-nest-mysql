import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Auth(Role.ADMIN)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto, @ActiveUser() activeUser: IActiveUser) {
        return this.categoriesService.create(createCategoryDto, activeUser);
    }

    @Get()
    @Roles(Role.USER)
    findAll() {
        return this.categoriesService.findAll();
    }

    @Get('withDeleted')
    findAllWithDeleted() {
        return this.categoriesService.findAllWithDeleted();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.categoriesService.findOne(id);
    }

    @Get(':id/withDeleted')
    findOneWithDeleted(@Param('id') id: number) {
        return this.categoriesService.findOneWithDeleted(id);
    }

    @Patch(':id')
    update(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto, @ActiveUser() activeUser: IActiveUser) {
        return this.categoriesService.update(id, updateCategoryDto, activeUser);
    }

    @Patch(':id/restore')
    restore(@Param('id') id: number, @ActiveUser() activeUser: IActiveUser) {
        return this.categoriesService.restore(id, activeUser);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.categoriesService.remove(id);
    }

    @Delete(':id/soft')
    removeSoft(@Param('id') id: number, @ActiveUser() activeUser: IActiveUser) {
        return this.categoriesService.removeSoft(id, activeUser);
    }
}
