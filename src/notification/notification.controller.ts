import { Controller, Get, Param, Put, UseGuards, Request } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './entity/notification.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<Notification>
    ) { }

    @Get('my-notifications')
    async getMyNotifications(@Request() req) {
        const userId = req.user.sub;
        const data = await this.notificationModel.find({ userId })
            .sort({ createdAt: -1 })
            .exec();

        return {
            success: true,
            message: 'Notifications fetched successfully',
            data
        };
    }

    @Get('user/:userId')
    async getByUserId(@Param('userId') userId: string) {
        const data = await this.notificationModel.find({ userId })
            .sort({ createdAt: -1 })
            .exec();

        return {
            success: true,
            message: 'Notifications fetched successfully',
            data
        };
    }

    @Put('read-all')
    async markAllAsRead(@Request() req) {
        const userId = req.user.sub;
        await this.notificationModel.updateMany(
            { userId, isRead: false },
            { $set: { isRead: true } }
        ).exec();

        return {
            success: true,
            message: 'All notifications marked as read'
        };
    }

    @Put(':id/read')
    async markAsRead(@Param('id') id: string) {
        await this.notificationModel.findByIdAndUpdate(id, { isRead: true }).exec();
        return {
            success: true,
            message: 'Notification marked as read'
        };
    }
}
