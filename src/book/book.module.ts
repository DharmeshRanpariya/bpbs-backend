import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { Book, BookSchema } from './entity/book.entity';
import { Order, OrderSchema } from '../order/entity/order.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Book.name, schema: BookSchema },
            { name: Order.name, schema: OrderSchema }
        ])
    ],
    controllers: [BookController],
    providers: [BookService],
    exports: [BookService]
})
export class BookModule { }
