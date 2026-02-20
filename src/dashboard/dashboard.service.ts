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

    async getStats(period: string = 'thisWeek') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Calculate Monday of the current week
        const currentMonday = new Date(today);
        const currentDay = currentMonday.getDay();
        const diffToMonday = currentMonday.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
        currentMonday.setDate(diffToMonday);
        currentMonday.setHours(0, 0, 0, 0);

        let startOfWeek = new Date(currentMonday);
        let endOfWeek = new Date(currentMonday);
        endOfWeek.setDate(currentMonday.getDate() + 7);

        if (period === 'lastWeek') {
            startOfWeek.setDate(startOfWeek.getDate() - 7);
            endOfWeek.setDate(endOfWeek.getDate() - 7);
        }

        const [
            userCount,
            schoolCount,
            totalVisit,
            completeVisit,
            rescheduledVisit,
            totalOrder,
            pendingOrder,
            partialOrder,
            completeOrder,
            revenueResult,
            todayOrderList,
            weeklyVisitResult
        ] = await Promise.all([
            this.userModel.countDocuments(),
            this.schoolModel.countDocuments(),
            this.visitModel.countDocuments(),
            this.visitModel.countDocuments({ status: 'completed' }),
            this.visitModel.countDocuments({ status: 'rescheduled' }),
            this.orderModel.countDocuments(),
            this.orderModel.countDocuments({ status: 'Pending' }),
            this.orderModel.countDocuments({ status: 'Partial' }),
            this.orderModel.countDocuments({ status: 'Completed' }),
            this.orderModel.aggregate([
                { $match: { status: 'Completed' } },
                { $group: { _id: null, total: { $sum: '$totalPayment' } } }
            ]),
            this.orderModel.find({
                createdAt: { $gte: today, $lt: tomorrow },
                userId: { $type: 'objectId' } as any
            })
                .populate('userId', 'username')
                .populate('schoolId', 'schoolName')
                .sort({ createdAt: -1 }),
            this.visitModel.aggregate([
                {
                    $match: {
                        scheduleDate: { $gte: startOfWeek, $lt: endOfWeek }
                    }
                },
                {
                    $group: {
                        _id: { $dayOfWeek: "$scheduleDate" },
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Process weekly trends to ensure all days are present
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyVisitTrends = [1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
            const result = weeklyVisitResult.find(r => r._id === dayIndex + 1);
            return {
                day: days[dayIndex],
                count: result ? result.count : 0
            };
        });

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
                partialOrder,
                completeOrder,
                todayOrderList,
                weeklyVisitTrends
            }
        };
    }

    async getUserTodayStats(userId: string) {
        if (!userId || !Types.ObjectId.isValid(userId)) {
            return {
                success: false,
                message: 'Invalid User ID provided',
                data: null
            };
        }
        const userObjectId = new Types.ObjectId(userId);
        const userMatchQuery = { $in: [userObjectId, userId] };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const [
            todayTotalOrder,
            todayCompletedOrder,
            totalOrder,
            completeOrder,
            orderList
        ] = await Promise.all([
            this.orderModel.countDocuments({
                userId: userMatchQuery,
                createdAt: { $gte: today, $lt: tomorrow }
            }),
            this.orderModel.countDocuments({
                userId: userMatchQuery,
                status: 'Completed',
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
                todayCompletedOrder,
                totalOrder,
                completeOrder,
                orderList
            }
        };
    }
}
