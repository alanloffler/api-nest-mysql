import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Auth(Role.ADMIN)
@Controller('business')
export class BusinessController {
    constructor(private readonly businessService: BusinessService) {}

    @Post()
    create(@Body() createBusinessDto: CreateBusinessDto, @ActiveUser() activeUser: IActiveUser) {
        return this.businessService.create(createBusinessDto, activeUser);
    }

    @Roles(Role.USER)
    @Get()
    findAll() {
        return this.businessService.findAll();
    }

    @Get('withDeleted')
    findAllWithDeleted() {
        return this.businessService.findAllWithDeleted();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.businessService.findOne(id);
    }

    @Get(':id/withDeleted')
    findOneWithDeleted(@Param('id') id: number) {
        return this.businessService.findOneWithDeleted(id);
    }

    @Patch(':id')
    update(@Param('id') id: number, @Body() updateBusinessDto: UpdateBusinessDto, @ActiveUser() activeUser: IActiveUser) {
        return this.businessService.update(id, updateBusinessDto, activeUser);
    }

    @Patch(':id/restore')
    restore(@Param('id') id: number, @ActiveUser() activeUser: IActiveUser) {
        return this.businessService.restore(id, activeUser);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.businessService.remove(id);
    }

    @Delete(':id/soft')
    removeSoft(@Param('id') id: number, @ActiveUser() activeUser: IActiveUser) {
        return this.businessService.removeSoft(id, activeUser);
    }
}
