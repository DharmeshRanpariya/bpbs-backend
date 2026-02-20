import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { ZoneService } from './zone.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('zone')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ZoneController {
    constructor(private readonly zoneService: ZoneService) { }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() createZoneDto: CreateZoneDto) {
        return this.zoneService.create(createZoneDto);
    }

    @Get()
    findAll() {
        return this.zoneService.findAll();
    }

    @Get('detailed-list')
    findAllWithDetails(@Query('search') search: string) {
        return this.zoneService.findAllWithDetails(search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.zoneService.findOne(id);
    }

    @Put(':id')
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() updateZoneDto: UpdateZoneDto) {
        return this.zoneService.update(id, updateZoneDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.zoneService.remove(id);
    }
}
