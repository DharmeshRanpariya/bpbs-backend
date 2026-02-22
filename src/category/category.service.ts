import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './entity/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Book } from '../book/entity/book.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<Category>,
        @InjectModel(Book.name) private bookModel: Model<Book>,
    ) { }

    async findAllWithStats(search?: string) {
        try {
            const matchQuery: any = {};
            if (search) {
                matchQuery.name = { $regex: search, $options: 'i' };
            }

            const data = await this.categoryModel.aggregate([
                { $match: matchQuery },
                {
                    $lookup: {
                        from: 'books',
                        let: { categoryId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $or: [
                                            { $eq: ['$category', '$$categoryId'] },
                                            { $eq: ['$category', { $toString: '$$categoryId' }] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'books'
                    }
                },
                {
                    $project: {
                        name: 1,
                        image: 1,
                        description: 1,
                        totalBooks: { $size: '$books' }
                    }
                }
            ]);

            return {
                success: true,
                message: 'Categories with stats fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching categories with stats',
                data: null,
            };
        }
    }

    async create(createCategoryDto: CreateCategoryDto, imagePath?: string) {
        try {
            const newCategory = new this.categoryModel({
                ...createCategoryDto,
                image: imagePath || createCategoryDto.image
            });
            const data = await newCategory.save();
            return {
                success: true,
                message: 'Category created successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while creating category',
                data: null,
            };
        }
    }

    async findAll(search?: string) {
        try {
            const filter: any = {};
            if (search) {
                filter.name = { $regex: search, $options: 'i' };
            }

            const data = await this.categoryModel.find(filter).exec();
            return {
                success: true,
                message: 'Categories fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching categories',
                data: null,
            };
        }
    }

    async findOne(id: string) {
        try {
            const data = await this.categoryModel.findById(id).exec();
            if (!data) {
                return {
                    success: false,
                    message: `Category with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Category fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching category',
                data: null,
            };
        }
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto, imagePath?: string) {
        try {
            const updateData = {
                ...updateCategoryDto,
            };
            if (imagePath) {
                updateData.image = imagePath;
            }

            const data = await this.categoryModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
            if (!data) {
                return {
                    success: false,
                    message: `Category with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Category updated successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while updating category',
                data: null,
            };
        }
    }

    async remove(id: string) {
        try {
            const data = await this.categoryModel.findByIdAndDelete(id).exec();
            if (!data) {
                return {
                    success: false,
                    message: `Category with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Category deleted successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while deleting category',
                data: null,
            };
        }
    }

    async getCategoryList() {
        const data = await this.categoryModel.find({}, '_id name').exec();
        return {
            success: true,
            message: 'Category list fetched successfully',
            data,
        };
    }
}
