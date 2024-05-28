import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/role.enum';
import { ActivePropertyDto } from './dto/active-property.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Auth(Role.USER)
@Controller('properties')
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) {}

    @Post()
    create(@Body() createPropertyDto: CreatePropertyDto, @ActiveUser() activeUser: IActiveUser) {
        return this.propertiesService.create(createPropertyDto, activeUser);
    }

    @Get('/client')
    findAllClient() {
        return this.propertiesService.findAllClient();
    }
    
    @Get()
    findAll(@ActiveUser() activeUser: IActiveUser) {
        return this.propertiesService.findAll(activeUser);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @ActiveUser() activeUser: IActiveUser) {
        return this.propertiesService.findOne(id, activeUser);
    }

    @Get(':id/client')
    findOneClient(@Param('id', ParseIntPipe) id: number) {
        return this.propertiesService.findOneClient(id);
    }
    
    @Get(':id/withDeleted')
    @Roles(Role.ADMIN)
    findOneWithDeleted(@Param('id', ParseIntPipe) id: number) {
        return this.propertiesService.findOneWithDeleted(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePropertyDto: UpdatePropertyDto,
        @ActiveUser() activeUser: IActiveUser,
    ) {
        return this.propertiesService.update(id, updatePropertyDto, activeUser);
    }

    @Patch(':id/active')
    updateActive(
        @Param('id', ParseIntPipe) id: number,
        @Body() activePropertyDto: ActivePropertyDto,
        @ActiveUser() activeUser: IActiveUser,
    ) {
        return this.propertiesService.updateActive(id, activePropertyDto, activeUser);
    }

    @Patch(':id/restore')
    @Roles(Role.ADMIN)
    restore(@Param('id', ParseIntPipe) id: number) {
        return this.propertiesService.restore(id);
    }

    @Delete(':id/soft')
    removeSoft(@Param('id', ParseIntPipe) id: number, @ActiveUser() activeUser: IActiveUser) {
        return this.propertiesService.removeSoft(id, activeUser);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.propertiesService.remove(id);
    }

    // DASHBOARD
    @Get(':amount/latest')
    findLatest(@Param('amount', ParseIntPipe) amount: number) {
        return this.propertiesService.findLatest(amount);
    }
    
    @Get(':amount/latestActiveUser')
    findLatestUserOnly(@Param('amount', ParseIntPipe) amount: number, @ActiveUser() activeUser: IActiveUser) {
        return this.propertiesService.findLatestActiveUser(amount, activeUser);
    }

    @Get('dashboard/dashboardStats')
    countByCreator(@ActiveUser() activeUser: IActiveUser) {
        return this.propertiesService.dashboardStats(activeUser);
    }
}
