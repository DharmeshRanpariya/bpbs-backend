import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './entity/user.entity';
import { Order } from '../order/entity/order.entity';
import { Visit } from '../visit/entity/visit.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { School } from '../school/entity/school.entity';
import { Notification } from '../notification/entity/notification.entity';
import * as bcrypt from 'bcrypt';
import { normalizeZone } from '../common/utils/zone-normalization.util';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Visit.name) private visitModel: Model<Visit>,
        @InjectModel(School.name) private schoolModel: Model<School>,
        @InjectModel(Notification.name) private notificationModel: Model<Notification>,
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

    async findAll(query: { page?: number, limit?: number, search?: string, zone?: string }) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (query.search) {
            filter.username = { $regex: query.search, $options: 'i' };
        }
        if (query.zone) {
            filter.assignedZone = normalizeZone(query.zone);
        }

        const [data, filteredCount, totalUserCount, activeUserCount] = await Promise.all([
            this.userModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.userModel.countDocuments(filter).exec(),
            this.userModel.countDocuments().exec(),
            this.userModel.countDocuments({ status: 'active' }).exec(),
        ]);

        return {
            success: true,
            message: 'Users fetched successfully',
            data,
            totalUserCount,
            activeUserCount,
            pagination: {
                total: filteredCount,
                page,
                limit,
                pages: Math.ceil(filteredCount / limit),
            }
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
        const [totalVisit, totalOrder, completedOrder, totalSchools, lastVisit, lastOrder] = await Promise.all([
            this.visitModel.countDocuments({ userId: userMatchQuery }),
            this.orderModel.countDocuments({ userId: userMatchQuery }),
            this.orderModel.countDocuments({ userId: userMatchQuery, status: 'Completed' }),
            this.schoolModel.countDocuments({ zone: user.assignedZone }),
            this.visitModel.findOne({ userId: userMatchQuery }).sort({ createdAt: -1 }).select('createdAt').exec(),
            this.orderModel.findOne({ userId: userMatchQuery }).sort({ createdAt: -1 }).select('createdAt').exec(),
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

        // Determine last activity
        const activities = [
            user.lastLogin,
            lastVisit ? (lastVisit as any).createdAt : null,
            lastOrder ? (lastOrder as any).createdAt : null
        ].filter(date => date != null);

        const lastActivity = activities.length > 0
            ? new Date(Math.max(...activities.map(d => new Date(d).getTime())))
            : null;

        const data = {
            ...user.toObject(),
            stats: {
                totalVisit,
                totalOrder,
                completedOrder,
                todayOrder,
                revenue,
                totalSchools,
                lastActivity
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

    async toggleStatus(id: string) {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        user.status = user.status === 'active' ? 'deactive' : 'active';
        const data = await user.save();
        return {
            success: true,
            message: `User status changed to ${user.status}`,
            data,
        };
    }

    async getUserActivity(userId: string) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const userObjectId = user._id;
        const userIdStr = userObjectId.toString();
        const userMatchQuery = { $in: [userObjectId, userIdStr] };

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const [
            todayOrders,
            todayVisits,
            allVisits,
            allOrders,
            assignedSchools,
            notifications
        ] = await Promise.all([
            this.orderModel.find({
                userId: userMatchQuery,
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            }).populate('schoolId', 'schoolName').exec(),
            this.visitModel.find({
                userId: userMatchQuery,
                scheduleDate: { $gte: startOfDay, $lte: endOfDay }
            }).populate('schoolId', 'schoolName').exec(),
            this.visitModel.find({ userId: userMatchQuery })
                .populate('schoolId', 'schoolName')
                .sort({ scheduleDate: -1 }).exec(),
            this.orderModel.find({ userId: userMatchQuery })
                .populate('schoolId', 'schoolName')
                .sort({ createdAt: -1 }).exec(),
            this.schoolModel.find({ zone: user.assignedZone }).exec(),
            this.notificationModel.find({ userId: userMatchQuery })
                .sort({ createdAt: -1 }).limit(20).exec()
        ]);

        return {
            success: true,
            message: 'User activity fetched successfully',
            data: {
                todayActivity: {
                    orders: todayOrders,
                    visits: todayVisits,
                    orderCount: todayOrders.length,
                    visitCount: todayVisits.length
                },
                allVisits,
                allOrders,
                assignedSchools,
                notifications
            }
        };
    }

    async getUserList() {
        const data = await this.userModel.find({}, '_id username').exec();
        return {
            success: true,
            message: 'User list fetched successfully',
            data,
        };
    }
}
