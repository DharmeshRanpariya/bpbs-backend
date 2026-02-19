import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../user/entity/user.entity';
import { School } from '../school/entity/school.entity';
import { Visit } from '../visit/entity/visit.entity';
import { Order } from '../order/entity/order.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(School.name) private schoolModel: Model<School>,
        @InjectModel(Visit.name) private visitModel: Model<Visit>,
        @InjectModel(Order.name) private orderModel: Model<Order>,
    ) { }

    async getStats() {
        const [
            userCount,
            schoolCount,
            totalVisit,
            completeVisit,
            rescheduledVisit,
            totalOrder,
            pendingOrder,
            completeOrder,
            revenueResult
        ] = await Promise.all([
            this.userModel.countDocuments(),
            this.schoolModel.countDocuments(),
            this.visitModel.countDocuments(),
            this.visitModel.countDocuments({ status: 'completed' }),
            this.visitModel.countDocuments({ status: 'rescheduled' }),
            this.orderModel.countDocuments(),
            this.orderModel.countDocuments({ status: 'Pending' }),
            this.orderModel.countDocuments({ status: 'Completed' }),
            this.orderModel.aggregate([
                { $match: { status: 'Completed' } },
                { $group: { _id: null, total: { $sum: '$totalPayment' } } }
            ])
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        return {
            success: true,
            message: 'Dashboard statistics fetched successfully',
            data: {
                userCount,
                schoolCount,
                totalVisit,
                completeVisit,
                rescheduledVisit,
                totalOrder,
                totalRevenue,
                pendingOrder,
                completeOrder
            }
        };
    }

    async getUserTodayStats(userId: string) {
        const userObjectId = new Types.ObjectId(userId);
        const userMatchQuery = { $in: [userObjectId, userId] };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const [
            todayTotalOrder,
            totalOrder,
            completeOrder,
            orderList
        ] = await Promise.all([
            this.orderModel.countDocuments({
                userId: userMatchQuery,
                createdAt: { $gte: today, $lt: tomorrow }
            }),
            this.orderModel.countDocuments({ userId: userMatchQuery }),
            this.orderModel.countDocuments({
                userId: userMatchQuery,
                status: 'Completed'
            }),
            this.orderModel.find({ userId: userMatchQuery })
                .select('status totalPayment schoolId createdAt')
                .populate('schoolId', 'schoolName')
                .sort({ createdAt: -1 })
        ]);

        return {
            success: true,
            message: 'User dashboard statistics fetched successfully',
            data: {
                todayDate: new Date(),
                todayTotalOrder,
                totalOrder,
                completeOrder,
                orderList
            }
        };
    }
}
