import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './entity/user.entity';
import { Order, OrderSchema } from '../order/entity/order.entity';
import { Visit, VisitSchema } from '../visit/entity/visit.entity';
import { School, SchoolSchema } from '../school/entity/school.entity';

import { AuthModule } from '../auth/auth.module';
import { forwardRef } from '@nestjs/common';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Order.name, schema: OrderSchema },
            { name: Visit.name, schema: VisitSchema },
            { name: School.name, schema: SchoolSchema },
        ]),
        forwardRef(() => AuthModule),
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule { }
