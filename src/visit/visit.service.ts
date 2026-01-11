import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
            // Check if a visit with same userId and schoolId already exists
            const existingVisit = await this.visitModel.findOne({
                userId: createVisitDto.userId,
                schoolId: createVisitDto.schoolId
            }).exec();

            if (existingVisit) {
                // If it exists, append new visitDetails
                if (createVisitDto.visitDetails && createVisitDto.visitDetails.length > 0) {
                    const mappedDetails = createVisitDto.visitDetails.map(detail => ({
                        ...detail,
                        date: new Date(detail.date),
                        nextVisitDate: detail.nextVisitDate ? new Date(detail.nextVisitDate) : undefined
                    }));
                    existingVisit.visitDetails.push(...(mappedDetails as any));
                }

                // Update scheduleDate and status
                existingVisit.scheduleDate = new Date(createVisitDto.scheduleDate);
                existingVisit.status = createVisitDto.status || this.calculateStatus(existingVisit.visitDetails);

                const data = await existingVisit.save();
                return {
                    success: true,
                    message: 'Visit updated with new details successfully',
                    data,
                };
            }

            // Apply status logic for new visit
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
                message: error.message || 'Error occurred while creating/updating visit',
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

            let schools = schoolResponse.data;

            // Filter schools by name if provided
            if (schoolName) {
                schools = schools.filter((school: any) =>
                    school.schoolName.toLowerCase().includes(schoolName.toLowerCase())
                );
            }

            const schoolIdsStrings = schools.map((school: any) => school._id.toString());
            const schoolIdsObjects = schoolIdsStrings.map(id => new Types.ObjectId(id));

            console.log('Searching visits for schoolIds:', schoolIdsStrings);

            // 2. Get ALL visits for these schools
            // We search with both string and ObjectId formats to be 100% sure
            const visitQuery: any = {
                schoolId: { $in: [...schoolIdsStrings, ...schoolIdsObjects] }
            };

            const visits = await this.visitModel.find(visitQuery)
                .populate('userId', 'username email')
                .exec();

            console.log(`Found ${visits.length} total visits for these schools`);
            if (visits.length > 0) {
                console.log('Sample visit schoolId type:', typeof visits[0].schoolId, visits[0].schoolId);
            }

            // 3. Map visits to schools
            const data = schools.map((school: any) => {
                const schoolObj = school.toObject ? school.toObject() : school;
                const schoolIdStr = schoolObj._id.toString();

                // Find all visits for this specific school
                const schoolVisits = visits.filter((visit: any) => {
                    const visitSchoolId = visit.schoolId;
                    if (!visitSchoolId) return false;

                    // Direct string comparison of the IDs
                    return visitSchoolId.toString() === schoolIdStr;
                });

                // Determine school status: use the status of the most recently updated visit.
                let currentStatus = 'pending';
                if (schoolVisits.length > 0) {
                    const sortedVisits = [...schoolVisits].sort((a: any, b: any) =>
                        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                    );
                    currentStatus = sortedVisits[0].status;
                }

                return {
                    ...schoolObj,
                    visits: schoolVisits,
                    currentStatus
                };
            });

            // 4. Apply status filter in memory if provided
            const finalData = status
                ? data.filter(item => item.currentStatus === status)
                : data;

            return {
                success: true,
                message: `Schools and visits for zone ${assignedZone} fetched successfully`,
                visitCount: visits.length,
                data: finalData,
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
