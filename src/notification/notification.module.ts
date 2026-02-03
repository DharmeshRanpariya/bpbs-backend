import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { NotificationScheduler } from './notification.scheduler';
import { Visit, VisitSchema } from '../visit/entity/visit.entity';
import { User, UserSchema } from '../user/entity/user.entity';
import { School, SchoolSchema } from '../school/entity/school.entity';

import { Notification, NotificationSchema } from './entity/notification.entity';

import { NotificationController } from './notification.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Visit.name, schema: VisitSchema },
            { name: User.name, schema: UserSchema },
            { name: School.name, schema: SchoolSchema },
            { name: Notification.name, schema: NotificationSchema },
        ]),
    ],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationScheduler],
    exports: [NotificationService],
})
export class NotificationModule { }
