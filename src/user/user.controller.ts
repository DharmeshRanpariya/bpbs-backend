import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { multerOptions } from '../common/utils/multer-options.util';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @UseInterceptors(FileInterceptor('profilePhoto', multerOptions))
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() createUserDto: CreateUserDto,
    ) {
        let profilePhotoPath = '';
        if (file) {
            profilePhotoPath = `/uploads/${file.filename}`;
        }
        return this.userService.create(createUserDto, profilePhotoPath);
    }

    @Get()
    async findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('profilePhoto', multerOptions))
    async update(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() updateUserDto: any,
    ) {
        let profilePhotoPath: string | undefined = undefined;
        if (file) {
            profilePhotoPath = `/uploads/${file.filename}`;
        }
        return this.userService.update(id, updateUserDto, profilePhotoPath);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }
}
