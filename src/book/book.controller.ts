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
        { name: 'coverImage', maxCount: 1 },
        { name: 'pdf', maxCount: 1 },
    ], multerOptions))
    create(
        @UploadedFiles() files: { coverImage?: Express.Multer.File[], pdf?: Express.Multer.File[] },
        @Body() createBookDto: CreateBookDto,
    ) {
        let coverImagePath = '';
        let pdfPath = '';

        if (files.coverImage && files.coverImage.length > 0) {
            coverImagePath = `/uploads/${files.coverImage[0].filename}`;
        }
        if (files.pdf && files.pdf.length > 0) {
            pdfPath = `/uploads/${files.pdf[0].filename}`;
        }

        return this.bookService.create(createBookDto, coverImagePath, pdfPath);
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
        { name: 'coverImage', maxCount: 1 },
        { name: 'pdf', maxCount: 1 },
    ], multerOptions))
    update(
        @Param('id') id: string,
        @UploadedFiles() files: { coverImage?: Express.Multer.File[], pdf?: Express.Multer.File[] },
        @Body() updateBookDto: UpdateBookDto,
    ) {
        let coverImagePath: string | undefined = undefined;
        let pdfPath: string | undefined = undefined;

        if (files.coverImage && files.coverImage.length > 0) {
            coverImagePath = `/uploads/${files.coverImage[0].filename}`;
        }
        if (files.pdf && files.pdf.length > 0) {
            pdfPath = `/uploads/${files.pdf[0].filename}`;
        }

        return this.bookService.update(id, updateBookDto, coverImagePath, pdfPath);
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
