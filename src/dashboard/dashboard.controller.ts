import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    async getStats() {
        return this.dashboardService.getStats();
    }

    @Get('user-stats')
    async getUserTodayStats(@Request() req) {
        return this.dashboardService.getUserTodayStats(req.user.userId);
    }
}
