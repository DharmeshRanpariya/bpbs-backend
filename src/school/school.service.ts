import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School } from './entity/school.entity';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { normalizeZone } from '../common/utils/zone-normalization.util';

@Injectable()
export class SchoolService {
    constructor(@InjectModel(School.name) private schoolModel: Model<School>) { }

    async create(createSchoolDto: CreateSchoolDto) {
        const newSchool = new this.schoolModel({
            ...createSchoolDto,
            zone: normalizeZone(createSchoolDto.zone),
        });
        const data = await newSchool.save();
        return {
            success: true,
            message: 'School created successfully',
            data,
        };
    }

    async findAll(search?: string) {
        const filter = search ? { schoolName: { $regex: search, $options: 'i' } } : {};
        const data = await this.schoolModel.find(filter).exec();
        return {
            success: true,
            message: 'Schools fetched successfully',
            data,
        };
    }

    async findOne(id: string) {
        const data = await this.schoolModel.findById(id).exec();
        if (!data) {
            throw new NotFoundException(`School with ID ${id} not found`);
        }
        return {
            success: true,
            message: 'School fetched successfully',
            data,
        };
    }

    async update(id: string, updateSchoolDto: UpdateSchoolDto) {
        const updateData: any = { ...updateSchoolDto };
        if (updateSchoolDto.zone) {
            updateData.zone = normalizeZone(updateSchoolDto.zone);
        }
        const data = await this.schoolModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
        if (!data) {
            throw new NotFoundException(`School with ID ${id} not found`);
        }
        return {
            success: true,
            message: 'School updated successfully',
            data,
        };
    }

    async remove(id: string) {
        const data = await this.schoolModel.findByIdAndDelete(id).exec();
        if (!data) {
            throw new NotFoundException(`School with ID ${id} not found`);
        }
        return {
            success: true,
            message: 'School deleted successfully',
            data,
        };
    }

    async findByZone(zone: string, search?: string) {
        const filter: any = { zone: normalizeZone(zone) };
        if (search) {
            filter.schoolName = { $regex: search, $options: 'i' };
        }
        const data = await this.schoolModel.find(filter).exec();
        return {
            success: true,
            message: 'Schools fetched by zone successfully',
            data,
        };
    }
}
