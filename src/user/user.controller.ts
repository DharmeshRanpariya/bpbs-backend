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
    UseGuards,
    UnauthorizedException,
    Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { multerOptions } from '../common/utils/multer-options.util';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) { }

    @Post('login')
    async login(@Body() loginDto: any) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async findAll() {
        return this.userService.findAll();
    }

    @Get('/profile')
    @UseGuards(JwtAuthGuard)
    async findOne(@Request() req) {
        return this.userService.findOne(req.user.userId);
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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }

    @Put(':id/fcm-token')
    @UseGuards(JwtAuthGuard)
    async updateFcmToken(@Param('id') id: string, @Body('fcmToken') fcmToken: string) {
        return this.userService.update(id, { fcmToken });
    }
}
