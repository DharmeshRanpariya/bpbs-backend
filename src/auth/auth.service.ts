import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

import { AttendanceService } from '../attendance/attendance.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private attendanceService: AttendanceService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.userService.findByUsername(username);
        if (user && user.status === 'deactive') {
            throw new UnauthorizedException('Account is deactivated. Please contact admin.');
        }
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(user: any, fcmToken?: string) {
        // Update last login and fcmToken if provided
        const updateData: any = { lastLogin: new Date() };
        if (fcmToken) {
            updateData.fcmToken = fcmToken;
        }
        await this.userService.updateLoginInfo(user._id, updateData);

        // Auto mark attendance for today
        await this.attendanceService.markAttendance(user._id.toString());

        const payload = {
            username: user.username,
            sub: user._id,
            role: user.role,
            assignedZone: user.assignedZone
        };
        return {
            success: true,
            message: 'Login successful',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                assignedZone: user.assignedZone,
                token: this.jwtService.sign(payload),
            }
        };
    }
}
