import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './entity/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
    constructor(@InjectModel(Book.name) private bookModel: Model<Book>) { }

    async create(createBookDto: CreateBookDto, coverImagePath?: string, pdfPath?: string) {
        try {
            const newBook = new this.bookModel({
                ...createBookDto,
                coverImage: coverImagePath || createBookDto.coverImage,
                pdf: pdfPath || createBookDto.pdf
            });
            const data = await newBook.save();
            return {
                success: true,
                message: 'Book created successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while creating book',
                data: null,
            };
        }
    }

    async findAll(search?: string) {
        try {
            const query: any = {};
            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }
            const data = await this.bookModel.find(query).populate('category', 'name').exec();
            return {
                success: true,
                message: 'Books fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching books',
                data: null,
            };
        }
    }

    async findOne(id: string) {
        try {
            const data = await this.bookModel.findById(id).populate('category', 'name').exec();
            if (!data) {
                return {
                    success: false,
                    message: `Book with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Book fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching book',
                data: null,
            };
        }
    }

    async update(id: string, updateBookDto: UpdateBookDto, coverImagePath?: string, pdfPath?: string) {
        try {
            const updateData: any = { ...updateBookDto };
            if (coverImagePath) updateData.coverImage = coverImagePath;
            if (pdfPath) updateData.pdf = pdfPath;

            const data = await this.bookModel.findByIdAndUpdate(id, updateData, { new: true }).populate('category', 'name').exec();
            if (!data) {
                return {
                    success: false,
                    message: `Book with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Book updated successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while updating book',
                data: null,
            };
        }
    }

    async remove(id: string) {
        try {
            const data = await this.bookModel.findByIdAndDelete(id).exec();
            if (!data) {
                return {
                    success: false,
                    message: `Book with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Book deleted successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while deleting book',
                data: null,
            };
        }
    }

    async findByCategory(categoryId: string, search?: string) {
        try {
            const query: any = { category: categoryId };
            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }
            const data = await this.bookModel.find(query).populate('category', 'name').exec();
            return {
                success: true,
                message: 'Books fetched by category successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching books by category',
                data: null,
            };
        }
    }
}
