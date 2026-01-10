import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { Book, BookSchema } from './entity/book.entity';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }])
    ],
    controllers: [BookController],
    providers: [BookService],
    exports: [BookService]
})
export class BookModule { }
