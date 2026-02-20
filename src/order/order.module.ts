import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order, OrderSchema } from './entity/order.entity';
import { User, UserSchema } from '../user/entity/user.entity';
import { Book, BookSchema } from '../book/entity/book.entity';
import { School, SchoolSchema } from '../school/entity/school.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: User.name, schema: UserSchema },
            { name: Book.name, schema: BookSchema },
            { name: School.name, schema: SchoolSchema }
        ])
    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService]
})
export class OrderModule { }
