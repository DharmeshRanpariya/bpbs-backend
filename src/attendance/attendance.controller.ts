import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post('mark')
    async markAttendance(@Req() req: any) {
        return this.attendanceService.markAttendance(req.user.userId);
    }

    @Get('my-monthly')
    async getMyMonthly(
        @Req() req: any,
        @Query('year') year: number,
        @Query('month') month: number,
        @Query('userId') userId: string
    ) {
        const targetUserId = userId || req.user.userId;
        const currentYear = Number(year) || new Date().getFullYear();
        const currentMonth = Number(month) || (new Date().getMonth() + 1);

        return this.attendanceService.getMonthAttendance(targetUserId, currentYear, currentMonth);
    }
}
