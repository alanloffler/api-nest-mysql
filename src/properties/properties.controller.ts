import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    ParseFilePipeBuilder,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/role.enum';
import { ActivePropertyDto } from './dto/active-property.dto';
import { Roles } from '../auth/decorators/roles.decorator';

import { Express } from 'express';

@Auth(Role.USER)
@Controller('properties')
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) {}

    @Post()
    create(@Body() createPropertyDto: CreatePropertyDto, @ActiveUser() activeUser: IActiveUser) {
        return this.propertiesService.create(createPropertyDto, activeUser);
    }

    @Get()
    findAll(@ActiveUser() activeUser: IActiveUser) {
        return this.propertiesService.findAll(activeUser);
    }

    @Get(':id')
    findOne(@Param('id') id: number, @ActiveUser() activeUser: IActiveUser) {
        return this.propertiesService.findOne(id, activeUser);
    }

    @Patch(':id')
    update(
        @Param('id') id: number,
        @Body() updatePropertyDto: UpdatePropertyDto,
        @ActiveUser() activeUser: IActiveUser,
    ) {
        return this.propertiesService.update(id, updatePropertyDto, activeUser);
    }

    @Patch(':id/active')
    updateActive(
        @Param('id') id: number,
        @Body() activePropertyDto: ActivePropertyDto,
        @ActiveUser() activeUser: IActiveUser,
    ) {
        return this.propertiesService.updateActive(id, activePropertyDto, activeUser);
    }

    @Patch(':id/restore')
    @Roles(Role.ADMIN)
    restore(@Param('id') id: number) {
        return this.propertiesService.restore(id);
    }

    @Delete(':id/soft')
    removeSoft(@Param('id') id: number, @ActiveUser() activeUser: IActiveUser) {
        return this.propertiesService.removeSoft(id, activeUser);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: number) {
        return this.propertiesService.remove(id);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    public async uploadImage(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
                .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
        )
        file: Express.Multer.File,
    ) {
        console.log(file);
        return file;
    }
}
