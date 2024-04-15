import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    ParseFilePipeBuilder,
    HttpStatus,
    HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ImagesService } from './images.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../common/enums/role.enum';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { CreateImageDto } from './dto/create-image.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Auth(Role.USER)
@Controller('images')
export class ImagesController {
    constructor(private readonly imagesService: ImagesService) {}

    @Get()
    findAll(@ActiveUser() activeUser: IActiveUser) {
        return this.imagesService.findAll(activeUser);
    }

    @Get(':id/allByProperty')
    findAllByProperty(@Param('id') id: number) {
        return this.imagesService.findAllByProperty(id);
    }

    @Get(':id')
    findOne(@Param('id') id: number, @ActiveUser() activeUser: IActiveUser) {
        return this.imagesService.findOne(id, activeUser);
    }

    @Patch(':id/restore')
    @Roles(Role.ADMIN)
    restore(@Param('id') id: number) {
        return this.imagesService.restore(id);
    }

    @Delete(':id/soft')
    removeSoft(@Param('id') id: number, @ActiveUser() activeUser: IActiveUser) {
        return this.imagesService.removeSoft(id, activeUser);
    }

    @Delete(':propertyId')
    @Roles(Role.ADMIN)
    remove(@Param('propertyId') propertyId: number) {
        return this.imagesService.remove(propertyId);
    }

    @Post('upload/:id')
    @UseInterceptors(FileInterceptor('file'))
    public async uploadImage(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
                .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
        )
        file: Express.Multer.File,
        @Param('id') id: number,
        @ActiveUser() activeUser: IActiveUser,
    ) {
        console.log(file, id);
        if (!file) throw new HttpException('File not uploaded', HttpStatus.BAD_REQUEST);
        const createImageDto: CreateImageDto = { name: file.filename, propertyId: id, uploaded_by: activeUser.id };
        return await this.imagesService.create(createImageDto, activeUser);
    }
}
