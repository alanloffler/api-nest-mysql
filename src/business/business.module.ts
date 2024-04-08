import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';

@Module({
    imports: [TypeOrmModule.forFeature([Business])],
    controllers: [BusinessController],
    providers: [BusinessService],
})
export class BusinessModule {}
