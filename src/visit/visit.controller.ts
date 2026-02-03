import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UseInterceptors, UploadedFile, Request, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VisitService } from './visit.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { multerOptions } from '../common/utils/multer-options.util';

@Controller('visit')
@UseGuards(JwtAuthGuard)
export class VisitController {
    constructor(private readonly visitService: VisitService) { }

    @Get('my-zone-visits')
    findMyZoneVisits(
        @Request() req,
        @Query('schoolName') schoolName: string,
        @Query('status') status: string
    ) {
        const assignedZone = req.user.assignedZone;
        console.log(assignedZone, req.user);
        return this.visitService.findByAssignedZone(assignedZone, schoolName, status);
    }

    @Post()
    @UseInterceptors(FileInterceptor('photo', multerOptions))
    create(
        @UploadedFile() file: Express.Multer.File,
        @Body() createVisitDto: CreateVisitDto
    ) {
        if (file) {
            const photoPath = `/uploads/${file.filename}`;

            // In multipart/form-data, arrays are often sent as JSON strings
            if (typeof createVisitDto.visitDetails === 'string') {
                try {
                    createVisitDto.visitDetails = JSON.parse(createVisitDto.visitDetails);
                } catch (e) {
                    // If parsing fails, it will remain a string and fail the Array.isArray check
                }
            }

            // If visitDetails exists and is an array, add photo to the first one
            if (Array.isArray(createVisitDto.visitDetails) && createVisitDto.visitDetails.length > 0) {
                createVisitDto.visitDetails[0].photo = photoPath;
            }
        }
        return this.visitService.create(createVisitDto);
    }

    @Get()
    findAll(
        @Query('schoolName') schoolName: string,
        @Query('status') status: string
    ) {
        return this.visitService.findAll(schoolName, status);
    }

    @Get('user')
    findByUser(
        @Request() req,
        @Query('schoolName') schoolName: string,
        @Query('status') status: string
    ) {
        const userId = req.user.userId.toString();
        console.log(userId);
        return this.visitService.findByUser(userId, schoolName, status);
    }

    @Get('user/monthly')
    findUserVisitsByMonth(
        @Request() req,
        @Query('year') year: string,
        @Query('month') month: string
    ) {
        const userId = req.user.userId.toString();
        const y = year ? parseInt(year) : new Date().getFullYear();
        const m = month ? parseInt(month) : new Date().getMonth() + 1;
        return this.visitService.findUserVisitsByMonth(userId, y, m);
    }

    @Get('school/:schoolId')
    findBySchool(@Param('schoolId') schoolId: string) {
        return this.visitService.findBySchool(schoolId);
    }

    @Get('user/school/:schoolId')
    findByUserAndSchool(
        @Request() req,
        @Param('schoolId') schoolId: string
    ) {
        const userId = req.user.userId;
        return this.visitService.findByUserAndSchool(userId, schoolId);
    }

    @Get('summary/details')
    getSummary(
        @Request() req,
        @Query('schoolId') schoolId: string,
        @Query('visitId') visitId?: string
    ) {
        const userId = req.user.userId.toString();
        return this.visitService.getVisitSummaryWithStats(schoolId, visitId, userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.visitService.findOne(id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('photo', multerOptions))
    update(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() updateVisitDto: UpdateVisitDto
    ) {
        if (file) {
            const photoPath = `/uploads/${file.filename}`;

            // In multipart/form-data, arrays are often sent as JSON strings
            if (typeof updateVisitDto.visitDetails === 'string') {
                try {
                    updateVisitDto.visitDetails = JSON.parse(updateVisitDto.visitDetails);
                } catch (e) {
                    // If parsing fails, it will remain a string and fail the Array.isArray check
                }
            }

            // If visitDetails exists and is an array, add photo to the first one
            if (Array.isArray(updateVisitDto.visitDetails) && updateVisitDto.visitDetails.length > 0) {
                updateVisitDto.visitDetails[0].photo = photoPath;
            }
        }
        return this.visitService.update(id, updateVisitDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.visitService.remove(id);
    }
}
