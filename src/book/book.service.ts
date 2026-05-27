import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Book } from './entity/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Order } from '../order/entity/order.entity';

@Injectable()
export class BookService {
    constructor(
        @InjectModel(Book.name) private bookModel: Model<Book>,
        @InjectModel(Order.name) private orderModel: Model<Order>
    ) { }

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
        const book = await this.bookModel.findById(id).exec();
        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        const relatedOrders = await this.orderModel.find({
            'orderItems.books.bookId': new Types.ObjectId(id)
        }).exec();

        if (relatedOrders.length > 0) {
            const hasNonCompletedOrder = relatedOrders.some(order => order.status !== 'Completed');
            if (hasNonCompletedOrder) {
                throw new BadRequestException('Cannot delete book because it is part of an order that is not completed.');
            }
        }

        const data = await this.bookModel.findByIdAndDelete(id).exec();
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
        const data = await this.bookModel.find({}, '_id name category price stock').exec();
        return {
            success: true,
            message: 'Book list fetched successfully',
            data,
        };
    }
}
