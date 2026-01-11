import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('school')
@UseGuards(JwtAuthGuard)
export class SchoolController {
    constructor(private readonly schoolService: SchoolService) { }

    @Post()
    create(@Body() createSchoolDto: CreateSchoolDto) {
        return this.schoolService.create(createSchoolDto);
    }

    @Get()
    findAll() {
        return this.schoolService.findAll();
    }

    @Get('zone/:zone')
    findByZone(@Param('zone') zone: string) {
        return this.schoolService.findByZone(zone);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.schoolService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
        return this.schoolService.update(id, updateSchoolDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.schoolService.remove(id);
    }
}
