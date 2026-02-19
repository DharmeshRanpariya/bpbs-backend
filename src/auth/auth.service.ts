import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
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

    async login(user: any) {
        // Update last login
        await this.userService.updateLastLogin(user._id);

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
