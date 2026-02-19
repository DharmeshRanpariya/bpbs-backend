import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/entity/user.entity';
import { School, SchoolSchema } from '../school/entity/school.entity';
import { Visit, VisitSchema } from '../visit/entity/visit.entity';
import { Order, OrderSchema } from '../order/entity/order.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: School.name, schema: SchoolSchema },
            { name: Visit.name, schema: VisitSchema },
            { name: Order.name, schema: OrderSchema },
        ]),
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
