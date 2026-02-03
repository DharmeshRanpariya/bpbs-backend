import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visit } from '../visit/entity/visit.entity';
import { User } from '../user/entity/user.entity';
import { School } from '../school/entity/school.entity';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationScheduler {
    private readonly logger = new Logger(NotificationScheduler.name);

    constructor(
        @InjectModel(Visit.name) private visitModel: Model<Visit>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(School.name) private schoolModel: Model<School>,
        private notificationService: NotificationService,
    ) { }

    // Run every day at 8:00 AM
    @Cron('0 8 * * *')
    async handleCron() {
        this.logger.debug('Running daily visit notification cron job at 8:00 AM');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        try {
            // Find visits where any visitDetail has nextVisitDate set to today
            const visits = await this.visitModel.find({
                'visitDetails.nextVisitDate': {
                    $gte: today,
                    $lt: tomorrow
                }
            }).populate('userId').populate('schoolId').exec();

            this.logger.debug(`Found ${visits.length} visits scheduled for today`);

            for (const visit of visits) {
                const user = visit.userId as any;
                const school = visit.schoolId as any;

                if (user && user.fcmToken) {
                    const title = 'Visit Reminder';
                    const body = `Aje tamare ${school.schoolName} ma visit che.`;

                    try {
                        await this.notificationService.sendNotification(
                            user._id.toString(),
                            user.fcmToken,
                            title,
                            body,
                            {
                                visitId: visit._id.toString(),
                                schoolId: school._id.toString(),
                                type: 'VISIT_REMINDER'
                            }
                        );
                        this.logger.log(`Notification sent to user ${user.username} for school ${school.schoolName}`);
                    } catch (err) {
                        this.logger.error(`Failed to send notification to user ${user.username}: ${err.message}`);
                    }
                } else {
                    this.logger.warn(`User ${user?._id} has no FCM token. Notification skipped.`);
                }
            }
        } catch (error) {
            this.logger.error('Error in visit notification cron job:', error);
        }
    }
}
