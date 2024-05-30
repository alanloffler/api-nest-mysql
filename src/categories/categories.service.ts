import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesConfig } from '../common/config/categories.config';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { IResponse } from '../common/interfaces/response.interface';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(@InjectRepository(Category) private categoryRepository: Repository<Category>) {}

    async create(createCategoryDto: CreateCategoryDto, activeUser: IActiveUser): Promise<IResponse> {
        const newCategory = this.categoryRepository.create({ ...createCategoryDto, createdBy: activeUser.id });

        const categoryCreated = await this.categoryRepository.save(newCategory);
        if (!categoryCreated) throw new HttpException(CategoriesConfig.notCreated, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: CategoriesConfig.created };
    }

    async findAll(): Promise<Category[]> {
        const categories = await this.categoryRepository.find({ order: { name: 'ASC' } });
        if (categories.length === 0) throw new HttpException(CategoriesConfig.notFoundMany, HttpStatus.NOT_FOUND);

        return categories;
    }

    async findAllWithDeleted(): Promise<Category[]> {
        const categories = await this.categoryRepository.find({ withDeleted: true, order: { name: 'ASC' } });
        if (categories.length === 0) throw new HttpException(CategoriesConfig.notFoundMany, HttpStatus.NOT_FOUND);

        return categories;
    }

    async findOne(id: number): Promise<Category> {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category) throw new HttpException(CategoriesConfig.notFound, HttpStatus.NOT_FOUND);

        return category;
    }

    async findOneWithDeleted(id: number): Promise<Category> {
        const category = await this.categoryRepository.findOne({ where: { id: id }, withDeleted: true });
        if (!category) throw new HttpException(CategoriesConfig.notFound, HttpStatus.NOT_FOUND);

        return category;
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto, activeUser: IActiveUser): Promise<IResponse> {
        await this.findOne(id);

        const categoryUpdated = await this.categoryRepository.update(id, {
            ...updateCategoryDto,
            updatedBy: activeUser.id,
        });

        if (categoryUpdated.affected === 0) {
            throw new HttpException(CategoriesConfig.notUpdated, HttpStatus.BAD_REQUEST);
        } else {
            return { statusCode: HttpStatus.OK, message: CategoriesConfig.updated };
        }
    }

    async remove(id: number): Promise<IResponse> {
        const categoryFound = await this.findOneWithDeleted(id);
        if (categoryFound.deletedAt !== null) {
            const categoryRestored = await this.categoryRepository.restore({ id: id });
            if (categoryRestored.affected === 0) throw new HttpException(CategoriesConfig.notDeletedRestored, HttpStatus.BAD_REQUEST);
        }

        const categoryDeleted = await this.categoryRepository.delete(id);
        if (categoryDeleted.affected === 0) throw new HttpException(CategoriesConfig.notDeleted, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: CategoriesConfig.deleted };
    }

    async removeSoft(id: number, activeUser: IActiveUser): Promise<IResponse> {
        await this.findOne(id);

        const categoryUpdated = await this.categoryRepository.update(id, { updatedBy: activeUser.id });
        if (categoryUpdated.affected === 0) throw new HttpException(CategoriesConfig.notUpdated, HttpStatus.BAD_REQUEST);

        const categoryDeleted = await this.categoryRepository.softDelete({ id: id });
        if (categoryDeleted.affected === 0) throw new HttpException(CategoriesConfig.notDeleted, HttpStatus.BAD_REQUEST);

        return { statusCode: HttpStatus.OK, message: CategoriesConfig.deleted };
    }

    async restore(id: number, activeUser: IActiveUser): Promise<IResponse> {
        const softDeletedCategories = await this.findOneWithDeleted(id);
        if (softDeletedCategories) {
            if (softDeletedCategories.deletedAt === null) {
                throw new HttpException(CategoriesConfig.notSoftDeleted, HttpStatus.BAD_REQUEST);
            } else {
                const categoryUpdated = await this.categoryRepository.update(id, { updatedBy: activeUser.id });
                if (categoryUpdated.affected === 0) throw new HttpException(CategoriesConfig.notUpdated, HttpStatus.BAD_REQUEST);

                const categoryRestored = await this.categoryRepository.restore({ id: id });
                if (categoryRestored.affected === 0) throw new HttpException(CategoriesConfig.notRestored, HttpStatus.BAD_REQUEST);

                return { statusCode: HttpStatus.OK, message: CategoriesConfig.restored };
            }
        } else {
            throw new HttpException(CategoriesConfig.notFound, HttpStatus.NOT_FOUND);
        }
    }
}
