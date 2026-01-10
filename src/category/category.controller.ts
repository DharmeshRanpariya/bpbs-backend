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
    UploadedFile,
    Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { multerOptions } from '../common/utils/multer-options.util';

@Controller('category')
@UseGuards(JwtAuthGuard)
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get('stats')
    findAllWithStats(@Query('search') search: string) {
        return this.categoryService.findAllWithStats(search);
    }

    @Post()
    @UseInterceptors(FileInterceptor('image', multerOptions))
    create(
        @UploadedFile() file: Express.Multer.File,
        @Body() createCategoryDto: CreateCategoryDto,
    ) {
        let imagePath = '';
        if (file) {
            imagePath = `/uploads/${file.filename}`;
        }
        return this.categoryService.create(createCategoryDto, imagePath);
    }

    @Get()
    findAll() {
        return this.categoryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoryService.findOne(id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('image', multerOptions))
    update(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        let imagePath: string | undefined = undefined;
        if (file) {
            imagePath = `/uploads/${file.filename}`;
        }
        return this.categoryService.update(id, updateCategoryDto, imagePath);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoryService.remove(id);
    }
}
