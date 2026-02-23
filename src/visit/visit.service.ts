import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Visit } from './entity/visit.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { SchoolService } from '../school/school.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class VisitService {
    constructor(
        @InjectModel(Visit.name) private visitModel: Model<Visit>,
        private readonly schoolService: SchoolService,
        private readonly orderService: OrderService
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
            // Prepare robust IDs to handle both string and ObjectId formats
            let userObjectId: any = createVisitDto.userId;
            let schoolObjectId: any = createVisitDto.schoolId;
            try {
                if (Types.ObjectId.isValid(createVisitDto.userId)) userObjectId = new Types.ObjectId(createVisitDto.userId);
                if (Types.ObjectId.isValid(createVisitDto.schoolId)) schoolObjectId = new Types.ObjectId(createVisitDto.schoolId);
            } catch (e) { }

            // Check if a visit with same userId and schoolId already exists and is NOT completed
            const existingVisit = await this.visitModel.findOne({
                userId: { $in: [createVisitDto.userId, userObjectId] },
                schoolId: { $in: [createVisitDto.schoolId, schoolObjectId] },
                status: { $ne: 'completed' }
            }).exec();

            if (existingVisit) {
                // If a non-completed visit exists, append new visitDetails to it
                if (createVisitDto.visitDetails && createVisitDto.visitDetails.length > 0) {
                    const mappedDetails = createVisitDto.visitDetails.map(detail => ({
                        ...detail,
                        date: new Date(detail.date),
                        nextVisitDate: detail.nextVisitDate ? new Date(detail.nextVisitDate) : undefined
                    }));
                    if (!existingVisit.visitDetails) {
                        existingVisit.visitDetails = [];
                    }
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

            // If no non-completed visit exists (either no visit at all, or existing visit is 'completed'),
            // create a new visit
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

    async findAll(queryObj: { page?: number, limit?: number, schoolName?: string, status?: string }) {
        try {
            const page = Number(queryObj.page) || 1;
            const limit = Number(queryObj.limit) || 10;
            const skip = (page - 1) * limit;

            const filter: any = {};

            if (queryObj.status) {
                filter.status = queryObj.status;
            }

            if (queryObj.schoolName) {
                const schoolResponse = await this.schoolService.findAll({ search: queryObj.schoolName });
                const matchedSchoolIds = (schoolResponse.data || []).map((school: any) => school._id);
                filter.schoolId = { $in: matchedSchoolIds };
            }

            const [visistData, filteredCount, totalVisist, CompleteVisist, pedingVisist, rescheduledVisist] = await Promise.all([
                this.visitModel.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('userId', 'username email')
                    .populate('schoolId', 'schoolName address')
                    .exec(),
                this.visitModel.countDocuments(filter).exec(),
                this.visitModel.countDocuments().exec(),
                this.visitModel.countDocuments({ status: 'completed' }).exec(),
                this.visitModel.countDocuments({ status: 'pending' }).exec(),
                this.visitModel.countDocuments({ status: 'rescheduled' }).exec(),
            ]);

            return {
                success: true,
                message: 'Visits fetched successfully',
                visistData,
                totalVisist,
                CompleteVisist,
                pedingVisist,
                rescheduledVisist,
                pagination: {
                    total: filteredCount,
                    page,
                    limit,
                    pages: Math.ceil(filteredCount / limit),
                }
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

    async findByUser(userId: string, schoolName?: string, status?: string) {
        try {
            let userObjectId: any = userId;
            if (Types.ObjectId.isValid(userId)) {
                userObjectId = new Types.ObjectId(userId);
            }

            const query: any = {
                userId: { $in: [userId, userObjectId] }
            };

            if (status) {
                query.status = status;
            }

            if (schoolName) {
                const schoolResponse = await this.schoolService.findAll({ search: schoolName });
                const matchedSchoolIds = (schoolResponse.data || []).map((school: any) => school._id.toString());

                if (matchedSchoolIds.length === 0) {
                    return {
                        success: true,
                        message: 'No visits found',
                        data: [],
                    };
                }

                query.schoolId = { $in: matchedSchoolIds };
            }

            const data = await this.visitModel.find(query)
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
            const data = await this.visitModel.find({
                schoolId,
                userId: { $nin: ["", null] }
            })
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
            console.log(userId, schoolId);
            const data = await this.visitModel.find({
                $and: [
                    { userId },
                    { schoolId },
                    { userId: { $nin: ["", null] } },
                    { schoolId: { $nin: ["", null] } }
                ]
            })
                .populate('userId', 'username email')
                .populate('schoolId')
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
            // and filter out any records with empty userIds to avoid populate crashes
            const visitQuery: any = {
                schoolId: { $in: [...schoolIdsStrings, ...schoolIdsObjects] },
                userId: { $nin: ["", null] }
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

    async findUserVisitsByMonth(userId: string, year?: number, month?: number) {
        try {
            let userObjectId: any = userId;
            try {
                if (Types.ObjectId.isValid(userId)) {
                    userObjectId = new Types.ObjectId(userId);
                }
            } catch (e) {
                console.error('Error casting userId to ObjectId:', e);
            }

            // Use $in with both string and ObjectId to be safe against inconsistent data
            const query: any = {
                userId: { $in: [userId, userObjectId] },
                schoolId: { $nin: ["", null] }
            };

            // Prevent crash on populate if userId is empty
            if (userId === "" || !userId) {
                query.userId = { $nin: ["", null] };
            }

            if (year && month) {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0, 23, 59, 59, 999);
                query.scheduleDate = { $gte: startDate, $lte: endDate };
            }

            const data = await this.visitModel.find(query)
                .populate('userId', 'username email')
                .populate('schoolId', 'schoolName address')
                .sort({ scheduleDate: -1 })
                .exec();

            return {
                success: true,
                message: (year && month) ? 'Visits fetched successfully for the month' : 'All user visits fetched successfully',
                data,
            };
        } catch (error) {
            console.error('Error in findUserVisitsByMonth:', error);
            return {
                success: false,
                message: error.message || 'Error occurred while fetching visits',
                data: null,
            };
        }
    }

    async getVisitSummaryWithStats(schoolId: string, visitId: string | undefined, userId: string) {
        try {
            // Prepare robust IDs
            let userObjectId: any = userId;
            let schoolObjectId: any = schoolId;
            try {
                if (Types.ObjectId.isValid(userId)) userObjectId = new Types.ObjectId(userId);
                if (Types.ObjectId.isValid(schoolId)) schoolObjectId = new Types.ObjectId(schoolId);
            } catch (e) { }

            const userMatch = { $in: [userId, userObjectId] };
            const schoolMatch = { $in: [schoolId, schoolObjectId] };

            // 2. Fetch Visit Details
            let visit;
            if (visitId) {
                visit = await this.visitModel.findById(visitId).exec();
            } else if (schoolId && userId) {
                // If visitId is not provided, try to find the visit for this user and school
                visit = await this.visitModel.findOne({
                    userId: userMatch,
                    schoolId: schoolMatch
                }).exec();
            }

            if (!visit) {
                return {
                    success: false,
                    message: 'Visit not found',
                    data: null
                };
            }

            // If visit was found but schoolId was not provided (though unlikely given the endpoint), use it from visit
            const finalSchoolId = schoolId || visit.schoolId.toString();

            // 1. Fetch School Details
            const schoolResponse = await this.schoolService.findOne(finalSchoolId);
            if (!schoolResponse.success) {
                return schoolResponse;
            }

            // Verify userId matches (compare strings to avoid type issues)
            if (userId && visit.userId.toString() !== userId.toString()) {
                return {
                    success: false,
                    message: 'Visit does not belong to the specified user',
                    data: null
                };
            }

            // 3. Fetch Order Stats
            const orderStats = await this.orderService.getSchoolStats(schoolId);

            // 4. Extract Visit Details stats
            const visitDetailsList = visit.visitDetails || [];
            const totalVisitDetails = visitDetailsList.length;
            const lastVisitDetail = totalVisitDetails > 0 ? visitDetailsList[totalVisitDetails - 1] : null;
            const lastVisitDate = lastVisitDetail ? lastVisitDetail.date : null;

            // Collect all remarks from visit details
            const remarks = visitDetailsList
                .map(detail => detail.remarks)
                .filter(remark => !!remark);

            return {
                success: true,
                message: 'Visit summary and stats fetched successfully',
                data: {
                    schoolDetails: schoolResponse.data,
                    visitDetails: visit,
                    stats: {
                        totalVisitDetails,
                        lastVisitDate,
                        status: visit.status,
                        remarks: remarks,
                        totalOrders: orderStats.totalOrders,
                        totalBooks: orderStats.totalBooks,
                        uniqueBooks: orderStats.uniqueBooks,
                        totalCategories: orderStats.totalCategories
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching visit summary',
                data: null
            };
        }
    }
}