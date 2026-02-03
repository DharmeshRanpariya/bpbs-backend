import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './entity/user.entity';
import { Order } from '../order/entity/order.entity';
import { Visit } from '../visit/entity/visit.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Visit.name) private visitModel: Model<Visit>,
    ) { }

    async create(createUserDto: CreateUserDto, profilePhotoPath?: string) {
        try {
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const newUser = new this.userModel({
                ...createUserDto,
                password: hashedPassword,
                profilePhoto: profilePhotoPath,
            });
            const data = await newUser.save();
            return {
                success: true,
                message: 'User created successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while creating user',
                data: null,
            };
        }
    }

    async findAll() {
        try {
            const data = await this.userModel.find().exec();
            return {
                success: true,
                message: 'Users fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching users',
                data: null,
            };
        }
    }

    async findOne(id: string) {
        try {
            const user = await this.userModel.findById(id).exec();
            if (!user) {
                return {
                    success: false,
                    message: `User with ID ${id} not found`,
                    data: null,
                };
            }

            // Calculate stats
            const totalVisit = await this.visitModel.countDocuments({ userId: new Types.ObjectId(id) });
            const totalOrder = await this.orderModel.countDocuments({ userId: new Types.ObjectId(id) });

            // Calculate completed orders
            const completedOrder = await this.orderModel.countDocuments({
                userId: new Types.ObjectId(id),
                status: 'Completed'
            });

            // Calculate today's orders
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const todayOrder = await this.orderModel.countDocuments({
                userId: new Types.ObjectId(id),
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            // Calculate revenue (sum of totalPayment from completed orders)
            const revenueResult = await this.orderModel.aggregate([
                { $match: { userId: new Types.ObjectId(id), status: 'Completed' } },
                { $group: { _id: null, total: { $sum: '$totalPayment' } } }
            ]);
            const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

            const data = {
                ...user.toObject(),
                stats: {
                    totalVisit,
                    totalOrder,
                    completedOrder,
                    todayOrder,
                    revenue,
                }
            };

            return {
                success: true,
                message: 'User fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching user',
                data: null,
            };
        }
    }

    async update(id: string, updateUserDto: any, profilePhotoPath?: string) {
        try {
            const updateData = { ...updateUserDto };
            if (profilePhotoPath) {
                updateData.profilePhoto = profilePhotoPath;
            }
            const data = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
            if (!data) {
                return {
                    success: false,
                    message: `User with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'User updated successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while updating user',
                data: null,
            };
        }
    }

    async remove(id: string) {
        try {
            const data = await this.userModel.findByIdAndDelete(id).exec();
            if (!data) {
                return {
                    success: false,
                    message: `User with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'User deleted successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while deleting user',
                data: null,
            };
        }
    }

    async findByUsername(username: string) {
        return this.userModel.findOne({ username }).exec();
    }

    async updateLastLogin(id: string) {
        return this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
    }
}
