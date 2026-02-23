import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, Delete } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Account')
@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) { }

    @Post()
    @ApiOperation({ summary: 'Create a single account entry' })
    create(@Body() createAccountDto: CreateAccountDto) {
        return this.accountService.create(createAccountDto);
    }

    @Post('upload/:schoolId')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Bulk upload account entries from Excel' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    uploadFile(@UploadedFile() file: Express.Multer.File, @Param('schoolId') schoolId: string) {
        return this.accountService.createBulk(file, schoolId);
    }

    @Get(':schoolId')
    @ApiOperation({ summary: 'Get all account entries for a school' })
    findAllBySchool(@Param('schoolId') schoolId: string) {
        return this.accountService.findAllBySchool(schoolId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an account entry' })
    remove(@Param('id') id: string) {
        return this.accountService.remove(id);
    }
}
