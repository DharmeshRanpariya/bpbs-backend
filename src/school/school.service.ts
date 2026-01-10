import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School } from './entity/school.entity';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolService {
    constructor(@InjectModel(School.name) private schoolModel: Model<School>) { }

    async create(createSchoolDto: CreateSchoolDto) {
        try {
            const newSchool = new this.schoolModel(createSchoolDto);
            const data = await newSchool.save();
            return {
                success: true,
                message: 'School created successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while creating school',
                data: null,
            };
        }
    }

    async findAll() {
        try {
            const data = await this.schoolModel.find().exec();
            return {
                success: true,
                message: 'Schools fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching schools',
                data: null,
            };
        }
    }

    async findOne(id: string) {
        try {
            const data = await this.schoolModel.findById(id).exec();
            if (!data) {
                return {
                    success: false,
                    message: `School with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'School fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching school',
                data: null,
            };
        }
    }

    async update(id: string, updateSchoolDto: UpdateSchoolDto) {
        try {
            const data = await this.schoolModel.findByIdAndUpdate(id, updateSchoolDto, { new: true }).exec();
            if (!data) {
                return {
                    success: false,
                    message: `School with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'School updated successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while updating school',
                data: null,
            };
        }
    }

    async remove(id: string) {
        try {
            const data = await this.schoolModel.findByIdAndDelete(id).exec();
            if (!data) {
                return {
                    success: false,
                    message: `School with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'School deleted successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while deleting school',
                data: null,
            };
        }
    }
}
