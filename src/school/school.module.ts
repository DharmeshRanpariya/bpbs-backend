import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';
import { School, SchoolSchema } from './entity/school.entity';
import { User, UserSchema } from '../user/entity/user.entity';
import { Order, OrderSchema } from '../order/entity/order.entity';
import { Visit, VisitSchema } from '../visit/entity/visit.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: School.name, schema: SchoolSchema },
            { name: User.name, schema: UserSchema },
            { name: Order.name, schema: OrderSchema },
            { name: Visit.name, schema: VisitSchema },
        ]),
    ],
    controllers: [SchoolController],
    providers: [SchoolService],
    exports: [SchoolService]
})
export class SchoolModule { }
