import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './entity/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
    constructor(@InjectModel(Order.name) private orderModel: Model<Order>) { }

    async create(createOrderDto: CreateOrderDto, imagePath?: string) {
        try {
            const newOrder = new this.orderModel({
                ...createOrderDto,
                image: imagePath || createOrderDto.image
            });
            const data = await newOrder.save();
            return {
                success: true,
                message: 'Order created successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while creating order',
                data: null,
            };
        }
    }

    async findAll() {
        try {
            const data = await this.orderModel.find()
                .populate('userId', 'username email')
                .populate('schoolId', 'schoolName address')
                .populate('orderItems.categoryId', 'name')
                .populate('orderItems.books.bookId', 'name price')
                .exec();
            return {
                success: true,
                message: 'Orders fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching orders',
                data: null,
            };
        }
    }

    async findOne(id: string) {
        try {
            const data = await this.orderModel.findById(id)
                .populate('userId', 'username email')
                .populate('schoolId', 'schoolName address')
                .populate('orderItems.categoryId', 'name')
                .populate('orderItems.books.bookId', 'name price')
                .exec();
            if (!data) {
                return {
                    success: false,
                    message: `Order with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Order fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching order',
                data: null,
            };
        }
    }

    async update(id: string, updateOrderDto: UpdateOrderDto, imagePath?: string) {
        try {
            const updateData: any = { ...updateOrderDto };
            if (imagePath) {
                updateData.image = imagePath;
            }

            const data = await this.orderModel.findByIdAndUpdate(id, updateData, { new: true })
                .populate('userId', 'username email')
                .populate('schoolId', 'schoolName address')
                .populate('orderItems.categoryId', 'name')
                .populate('orderItems.books.bookId', 'name price')
                .exec();
            if (!data) {
                return {
                    success: false,
                    message: `Order with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Order updated successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while updating order',
                data: null,
            };
        }
    }

    async remove(id: string) {
        try {
            const data = await this.orderModel.findByIdAndDelete(id).exec();
            if (!data) {
                return {
                    success: false,
                    message: `Order with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Order deleted successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while deleting order',
                data: null,
            };
        }
    }
}
