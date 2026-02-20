import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Zone } from './entity/zone.entity';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { User } from '../user/entity/user.entity';
import { School } from '../school/entity/school.entity';

@Injectable()
export class ZoneService {
    constructor(
        @InjectModel(Zone.name) private zoneModel: Model<Zone>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(School.name) private schoolModel: Model<School>,
    ) { }

    async create(createZoneDto: CreateZoneDto): Promise<Zone> {
        const createdZone = new this.zoneModel(createZoneDto);
        return createdZone.save();
    }

    async findAll(): Promise<Zone[]> {
        return this.zoneModel.find().sort({ name: 1 }).exec();
    }

    async findAllWithDetails(search?: string): Promise<any[]> {
        let filter: any = {};
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const zones = await this.zoneModel.find(filter).sort({ name: 1 }).exec();

        const result = await Promise.all(zones.map(async (zone) => {
            const [users, schools] = await Promise.all([
                this.userModel.find({ assignedZone: zone.name }).select('username email phoneNumber status').exec(),
                this.schoolModel.find({ zone: zone.name }).select('schoolName address contactPersonName contactNumber status').exec()
            ]);

            return {
                id: zone._id,
                name: zone.name,
                userCount: users.length,
                userList: users,
                schoolCount: schools.length,
                schoolList: schools
            };
        }));

        return result;
    }

    async findOne(id: string): Promise<Zone> {
        const zone = await this.zoneModel.findById(id).exec();
        if (!zone) {
            throw new NotFoundException(`Zone with ID ${id} not found`);
        }
        return zone;
    }

    async update(id: string, updateZoneDto: UpdateZoneDto): Promise<Zone> {
        const updatedZone = await this.zoneModel
            .findByIdAndUpdate(id, updateZoneDto, { new: true })
            .exec();
        if (!updatedZone) {
            throw new NotFoundException(`Zone with ID ${id} not found`);
        }
        return updatedZone;
    }

    async remove(id: string): Promise<any> {
        const result = await this.zoneModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Zone with ID ${id} not found`);
        }
        return { message: 'Zone deleted successfully' };
    }
}
