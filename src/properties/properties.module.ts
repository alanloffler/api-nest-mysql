import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Property } from './entities/property.entity';
import { UsersModule } from '../users/users.module';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { UsersService } from '../users/users.service';
import { diskStorage } from 'multer';

@Module({
    imports: [
        TypeOrmModule.forFeature([Property]),
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
        UsersModule,
    ],
    controllers: [PropertiesController],
    providers: [PropertiesService, UsersService],
})
export class PropertiesModule {}
