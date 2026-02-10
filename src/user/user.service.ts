import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './entity/user.entity';
import { Order } from '../order/entity/order.entity';
import { Visit } from '../visit/entity/visit.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { normalizeZone } from '../common/utils/zone-normalization.util';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Visit.name) private visitModel: Model<Visit>,
    ) { }

    async create(createUserDto: CreateUserDto, profilePhotoPath?: string) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const newUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
            profilePhoto: profilePhotoPath,
            assignedZone: createUserDto.assignedZone ? normalizeZone(createUserDto.assignedZone) : '',
        });
        const data = await newUser.save();
        return {
            success: true,
            message: 'User created successfully',
            data,
        };
    }

    async findAll() {
        const data = await this.userModel.find().exec();
        return {
            success: true,
            message: 'Users fetched successfully',
            data,
        };
    }

    async findOne(id: string) {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const userObjectId = user._id;
        const userIdStr = userObjectId.toString();
        // Powerful match pattern that works for both String and ObjectId storage
        const userMatchQuery = { $in: [userObjectId, userIdStr] };

        // Calculate stats robustly
        const [totalVisit, totalOrder, completedOrder] = await Promise.all([
            this.visitModel.countDocuments({ userId: userMatchQuery }),
            this.orderModel.countDocuments({ userId: userMatchQuery }),
            this.orderModel.countDocuments({ userId: userMatchQuery, status: 'Completed' })
        ]);

        // Calculate today's orders
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayOrder = await this.orderModel.countDocuments({
            userId: userMatchQuery,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // Calculate revenue robustly with aggregation
        const revenueResult = await this.orderModel.aggregate([
            { $match: { userId: userMatchQuery, status: 'Completed' } },
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
    }

    async update(id: string, updateUserDto: any, profilePhotoPath?: string) {
        const updateData = { ...updateUserDto };
        if (profilePhotoPath) {
            updateData.profilePhoto = profilePhotoPath;
        }
        if (updateUserDto.assignedZone) {
            updateData.assignedZone = normalizeZone(updateUserDto.assignedZone);
        }
        const data = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
        if (!data) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return {
            success: true,
            message: 'User updated successfully',
            data,
        };
    }

    async remove(id: string) {
        const data = await this.userModel.findByIdAndDelete(id).exec();
        if (!data) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return {
            success: true,
            message: 'User deleted successfully',
            data,
        };
    }

    async findByUsername(username: string) {
        return this.userModel.findOne({ username }).exec();
    }

    async updateLastLogin(id: string) {
        return this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
    }
}
