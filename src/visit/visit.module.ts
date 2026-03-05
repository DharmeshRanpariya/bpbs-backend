import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VisitService } from './visit.service';
import { VisitController } from './visit.controller';
import { Visit, VisitSchema } from './entity/visit.entity';
import { SchoolModule } from '../school/school.module';
import { OrderModule } from '../order/order.module';
import { NotificationModule } from '../notification/notification.module';
import { User, UserSchema } from '../user/entity/user.entity';
import { School, SchoolSchema } from '../school/entity/school.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Visit.name, schema: VisitSchema },
            { name: User.name, schema: UserSchema },
            { name: School.name, schema: SchoolSchema }
        ]),
        SchoolModule,
        OrderModule,
        NotificationModule
    ],
    controllers: [VisitController],
    providers: [VisitService],
    exports: [VisitService]
})
export class VisitModule { }
