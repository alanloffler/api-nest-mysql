import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
// import { PropertiesModule } from '../properties/properties.service';
import { PropertiesModule } from 'src/properties/properties.module';
import { PropertiesService } from 'src/properties/properties.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Image]),
        MulterModule.registerAsync({
            useFactory: () => ({
                storage: diskStorage({
                    destination: './uploads',
                    filename: (req: Express.Request, file: Express.Multer.File, callback: any) => {
                        callback(null, crypto.randomUUID() + '.' + file.originalname.split('.').pop());
                    },
                }),
            }),
        }),
        PropertiesModule,
        UsersModule
    ],
    controllers: [ImagesController],
    providers: [ImagesService, PropertiesService, UsersService],
    exports: [TypeOrmModule, ImagesService]
})
export class ImagesModule {}
