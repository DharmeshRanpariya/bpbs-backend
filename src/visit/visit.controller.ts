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
            // If visitDetails exists, add photo to the first one
            if (createVisitDto.visitDetails && createVisitDto.visitDetails.length > 0) {
                createVisitDto.visitDetails[0].photo = photoPath;
            } else if (typeof createVisitDto.visitDetails === 'string') {
                // In case class-transformer hasn't parsed it (though it should with validation pipe)
                try {
                    const details = JSON.parse(createVisitDto.visitDetails);
                    if (details.length > 0) {
                        details[0].photo = photoPath;
                        createVisitDto.visitDetails = details;
                    }
                } catch (e) { }
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
<<<<<<< Updated upstream
            if (updateVisitDto.visitDetails && updateVisitDto.visitDetails.length > 0) {
=======
            if (typeof updateVisitDto.visitDetails === 'string') {
                try {
                    updateVisitDto.visitDetails = JSON.parse(updateVisitDto.visitDetails);
                } catch (e) {
                }
            }

            if (Array.isArray(updateVisitDto.visitDetails) && updateVisitDto.visitDetails.length > 0) {
>>>>>>> Stashed changes
                updateVisitDto.visitDetails[0].photo = photoPath;
            } else if (typeof updateVisitDto.visitDetails === 'string') {
                try {
                    const details = JSON.parse(updateVisitDto.visitDetails);
                    if (details.length > 0) {
                        details[0].photo = photoPath;
                        updateVisitDto.visitDetails = details;
                    }
                } catch (e) { }
            }
        }
        return this.visitService.update(id, updateVisitDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.visitService.remove(id);
    }
}
