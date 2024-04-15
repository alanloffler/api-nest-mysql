import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(@InjectRepository(Category) private categoryRepository: Repository<Category>) {}

    async create(createCategoryDto: CreateCategoryDto, activeUser: IActiveUser): Promise<HttpException> {
        const newCategory = this.categoryRepository.create({ ...createCategoryDto, createdBy: activeUser.id });

        const categoryCreated = await this.categoryRepository.save(newCategory);
        if (!categoryCreated) throw new HttpException('Category not created', HttpStatus.BAD_REQUEST);

        return new HttpException('Category created', HttpStatus.OK);
    }

    async findAll(): Promise<Category[]> {
        const categories = await this.categoryRepository.find();
        if (categories.length === 0) throw new HttpException('Categories not found', HttpStatus.NOT_FOUND);

        return categories;
    }

    async findAllWithDeleted(): Promise<Category[]> {
        const categories = await this.categoryRepository.find({ withDeleted: true });
        if (categories.length === 0) throw new HttpException('Categories not found', HttpStatus.NOT_FOUND);

        return categories;
    }

    async findOne(id: number): Promise<Category> {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category) throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

        return category;
    }

    async findOneWithDeleted(id: number): Promise<Category> {
        const category = await this.categoryRepository.findOne({ where: { id: id }, withDeleted: true });
        if (!category) throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

        return category;
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto, activeUser: IActiveUser): Promise<HttpException> {
        await this.findOne(id);

        const categoryUpdated = await this.categoryRepository.update(id, {
            ...updateCategoryDto,
            updatedBy: activeUser.id,
        });

        if (categoryUpdated.affected === 0) {
            throw new HttpException('Category not updated', HttpStatus.BAD_REQUEST);
        } else {
            return new HttpException('Category updated', HttpStatus.OK);
        }
    }

    async remove(id: number): Promise<HttpException> {
        const categoryFound = await this.findOneWithDeleted(id);
        if (categoryFound.deletedAt !== null) {
            const categoryRestored = await this.categoryRepository.restore({ id: id });
            if (categoryRestored.affected === 0) throw new HttpException('Delete category failed: Category not restored', HttpStatus.BAD_REQUEST);
        }

        const categoryDeleted = await this.categoryRepository.delete(id);
        if (categoryDeleted.affected === 0) throw new HttpException('Category not deleted', HttpStatus.BAD_REQUEST);

        return new HttpException('Category deleted', HttpStatus.OK);
    }

    async removeSoft(id: number, activeUser: IActiveUser): Promise<HttpException> {
        await this.findOne(id);

        const categoryUpdated = await this.categoryRepository.update(id, { updatedBy: activeUser.id });
        if (categoryUpdated.affected === 0) throw new HttpException('Category not updated', HttpStatus.BAD_REQUEST);

        const categoryDeleted = await this.categoryRepository.softDelete({ id: id });
        if (categoryDeleted.affected === 0) throw new HttpException('Category not deleted', HttpStatus.BAD_REQUEST);

        return new HttpException('Category deleted', HttpStatus.OK);
    }

    async restore(id: number, activeUser: IActiveUser): Promise<HttpException> {
        const softDeletedCategories = await this.findOneWithDeleted(id);
        if (softDeletedCategories) {
            if (softDeletedCategories.deletedAt === null) {
                throw new HttpException('Category is not soft deleted', HttpStatus.CONFLICT);
            } else {
                const categoryUpdated = await this.categoryRepository.update(id, { updatedBy: activeUser.id });
                if (categoryUpdated.affected === 0) throw new HttpException('Category not updated', HttpStatus.BAD_REQUEST);

                const categoryRestored = await this.categoryRepository.restore({ id: id });
                if (categoryRestored.affected === 0) throw new HttpException('Category not restored', HttpStatus.NOT_MODIFIED);

                return new HttpException('Category restored', HttpStatus.OK);
            }
        } else {
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
    }
}
