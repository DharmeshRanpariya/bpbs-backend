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
            if (updateVisitDto.visitDetails && updateVisitDto.visitDetails.length > 0) {
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

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.visitService.findByUser(userId);
    }

    @Get('school/:schoolId')
    findBySchool(@Param('schoolId') schoolId: string) {
        return this.visitService.findBySchool(schoolId);
    }

    @Get('user/:userId/school/:schoolId')
    findByUserAndSchool(
        @Param('userId') userId: string,
        @Param('schoolId') schoolId: string
    ) {
        return this.visitService.findByUserAndSchool(userId, schoolId);
    }
}
