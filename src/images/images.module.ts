import { Module, forwardRef } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { diskStorage } from 'multer';
import { CategoriesModule } from '../categories/categories.module';
import { CategoriesService } from '../categories/categories.service';
import { Image } from './entities/image.entity';
import { ImagesConfig } from '../common/config/images.config';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { PropertiesModule } from '../properties/properties.module';
import { PropertiesService } from '../properties/properties.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Image]),
        MulterModule.registerAsync({
            useFactory: () => ({
                storage: diskStorage({
                    destination: ImagesConfig.destination,
                    filename: (req: Express.Request, file: Express.Multer.File, callback: any) => {
                        callback(null, crypto.randomUUID() + '.' + file.originalname.split('.').pop());
                    },
                }),
            }),
        }),
        CategoriesModule,
        forwardRef(() => PropertiesModule),
        UsersModule,
    ],
    controllers: [ImagesController],
    providers: [ImagesService, UsersService, CategoriesService, PropertiesService],
    exports: [TypeOrmModule, ImagesService],
})
export class ImagesModule {}
