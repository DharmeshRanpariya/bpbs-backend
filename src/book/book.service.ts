import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './entity/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
    constructor(@InjectModel(Book.name) private bookModel: Model<Book>) { }

    async create(createBookDto: CreateBookDto, coverImagePath?: string, pdfPath?: string) {
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
    }

    async findAll(search?: string) {
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
    }

    async findOne(id: string) {
        const data = await this.bookModel.findById(id).populate('category', 'name').exec();
        if (!data) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        return {
            success: true,
            message: 'Book fetched successfully',
            data,
        };
    }

    async update(id: string, updateBookDto: UpdateBookDto, coverImagePath?: string, pdfPath?: string) {
        const updateData: any = { ...updateBookDto };
        if (coverImagePath) updateData.coverImage = coverImagePath;
        if (pdfPath) updateData.pdf = pdfPath;

        const data = await this.bookModel.findByIdAndUpdate(id, updateData, { new: true }).populate('category', 'name').exec();
        if (!data) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        return {
            success: true,
            message: 'Book updated successfully',
            data,
        };
    }

    async remove(id: string) {
        const data = await this.bookModel.findByIdAndDelete(id).exec();
        if (!data) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        return {
            success: true,
            message: 'Book deleted successfully',
            data,
        };
    }

    async findByCategory(categoryId: string, search?: string) {
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
    }

    async getBookList() {
        const data = await this.bookModel.find({}, '_id name category').exec();
        return {
            success: true,
            message: 'Book list fetched successfully',
            data,
        };
    }
}
