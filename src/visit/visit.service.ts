import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visit } from './entity/visit.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { SchoolService } from '../school/school.service';

@Injectable()
export class VisitService {
    constructor(
        @InjectModel(Visit.name) private visitModel: Model<Visit>,
        private readonly schoolService: SchoolService
    ) { }

    private calculateStatus(visitDetails: any[]) {
        if (!visitDetails || visitDetails.length === 0) {
            return 'pending';
        }

        // Use the latest visit detail for status
        const latestDetail = visitDetails[visitDetails.length - 1];

        if (latestDetail.remarks) {
            return 'pending';
        }
        if (latestDetail.nextVisitDate) {
            return 'rescheduled';
        }
        return 'completed';
    }

    async create(createVisitDto: CreateVisitDto) {
        try {
            // Apply status logic if visitDetails are provided
            let status = 'pending';
            if (createVisitDto.visitDetails && createVisitDto.visitDetails.length > 0) {
                status = this.calculateStatus(createVisitDto.visitDetails);
            }

            const newVisit = new this.visitModel({
                ...createVisitDto,
                status: createVisitDto.status || status
            });

            const data = await newVisit.save();
            return {
                success: true,
                message: 'Visit created successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while creating visit',
                data: null,
            };
        }
    }

    async findAll(schoolName?: string, status?: string) {
        try {
            const query: any = {};

            if (status) {
                query.status = status;
            }

            if (schoolName) {
                // Find schools matching the name
                const schoolResponse = await this.schoolService.findAll();
                const matchedSchoolIds = (schoolResponse.data || [])
                    .filter((school: any) =>
                        school.schoolName.toLowerCase().includes(schoolName.toLowerCase()))
                    .map((school: any) => school._id);

                query.schoolId = { $in: matchedSchoolIds };
            }

            const data = await this.visitModel.find(query)
                .populate('userId', 'username email')
                .populate('schoolId', 'schoolName address')
                .exec();
            return {
                success: true,
                message: 'Visits fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching visits',
                data: null,
            };
        }
    }

    async findOne(id: string) {
        try {
            const data = await this.visitModel.findById(id)
                .populate('userId', 'username email')
                .populate('schoolId', 'schoolName address')
                .exec();
            if (!data) {
                return {
                    success: false,
                    message: `Visit with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Visit fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching visit',
                data: null,
            };
        }
    }

    async update(id: string, updateVisitDto: UpdateVisitDto) {
        try {
            // If visitDetails are updated, recalculate status
            const updateData: any = { ...updateVisitDto };

            if (updateVisitDto.visitDetails) {
                updateData.status = this.calculateStatus(updateVisitDto.visitDetails);
            }

            const data = await this.visitModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
            if (!data) {
                return {
                    success: false,
                    message: `Visit with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Visit updated successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while updating visit',
                data: null,
            };
        }
    }

    async remove(id: string) {
        try {
            const data = await this.visitModel.findByIdAndDelete(id).exec();
            if (!data) {
                return {
                    success: false,
                    message: `Visit with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Visit deleted successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while deleting visit',
                data: null,
            };
        }
    }

    async findByUser(userId: string) {
        try {
            const data = await this.visitModel.find({ userId })
                .populate('userId', 'username email')
                .populate('schoolId', 'schoolName address')
                .exec();
            return {
                success: true,
                message: 'Visits for user fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching visits for user',
                data: null,
            };
        }
    }

    async findBySchool(schoolId: string) {
        try {
            const data = await this.visitModel.find({ schoolId })
                .populate('userId', 'username email')
                .populate('schoolId', 'schoolName address')
                .exec();
            return {
                success: true,
                message: 'Visits for school fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching visits for school',
                data: null,
            };
        }
    }

    async findByUserAndSchool(userId: string, schoolId: string) {
        try {
            const data = await this.visitModel.find({ userId, schoolId })
                .populate('userId', 'username email')
                .populate('schoolId', 'schoolName address')
                .exec();
            return {
                success: true,
                message: 'Visits for user and school fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching visits for user and school',
                data: null,
            };
        }
    }

    async findByAssignedZone(assignedZone: string, schoolName?: string, status?: string) {
        try {
            // 1. Get all schools in the assigned zone
            const schoolResponse = await this.schoolService.findByZone(assignedZone);
            if (!schoolResponse.success || !schoolResponse.data.length) {
                return {
                    success: true,
                    message: 'No schools found in the assigned zone',
                    data: [],
                };
            }

            let schoolIds = schoolResponse.data.map((school: any) => school._id);

            // Filter schoolIds by schoolName if provided
            if (schoolName) {
                schoolIds = schoolResponse.data
                    .filter((school: any) =>
                        school.schoolName.toLowerCase().includes(schoolName.toLowerCase()))
                    .map((school: any) => school._id);
            }

            const query: any = { schoolId: { $in: schoolIds } };
            if (status) {
                query.status = status;
            }

            // 2. Get all visits for these schools
            const data = await this.visitModel.find(query)
                .populate('userId', 'username email')
                .populate('schoolId', 'schoolName address zone')
                .exec();

            return {
                success: true,
                message: `Visits for zone ${assignedZone} fetched successfully`,
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching visits by zone',
                data: null,
            };
        }
    }
}
