import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { multerOptions } from '../common/utils/multer-options.util';

@Controller('book')
@UseGuards(JwtAuthGuard)
export class BookController {
    constructor(private readonly bookService: BookService) { }

    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'image', maxCount: 1 },
        { name: 'video', maxCount: 1 },
    ], multerOptions))
    create(
        @UploadedFiles() files: { image?: Express.Multer.File[], video?: Express.Multer.File[] },
        @Body() createBookDto: CreateBookDto,
    ) {
        let imagePath = '';
        let videoPath = '';

        if (files.image && files.image.length > 0) {
            imagePath = `/uploads/${files.image[0].filename}`;
        }
        if (files.video && files.video.length > 0) {
            videoPath = `/uploads/${files.video[0].filename}`;
        }

        return this.bookService.create(createBookDto, imagePath, videoPath);
    }

    @Get()
    findAll(@Query('search') search: string) {
        return this.bookService.findAll(search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bookService.findOne(id);
    }

    @Put(':id')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'image', maxCount: 1 },
        { name: 'video', maxCount: 1 },
    ], multerOptions))
    update(
        @Param('id') id: string,
        @UploadedFiles() files: { image?: Express.Multer.File[], video?: Express.Multer.File[] },
        @Body() updateBookDto: UpdateBookDto,
    ) {
        let imagePath: string | undefined = undefined;
        let videoPath: string | undefined = undefined;

        if (files.image && files.image.length > 0) {
            imagePath = `/uploads/${files.image[0].filename}`;
        }
        if (files.video && files.video.length > 0) {
            videoPath = `/uploads/${files.video[0].filename}`;
        }

        return this.bookService.update(id, updateBookDto, imagePath, videoPath);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bookService.remove(id);
    }

    @Get('category/:categoryId')
    findByCategory(
        @Param('categoryId') categoryId: string,
        @Query('search') search: string
    ) {
        return this.bookService.findByCategory(categoryId, search);
    }
}
