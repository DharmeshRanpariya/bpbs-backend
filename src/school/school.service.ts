import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School } from './entity/school.entity';
import { User } from '../user/entity/user.entity';
import { Order } from '../order/entity/order.entity';
import { Visit } from '../visit/entity/visit.entity';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { normalizeZone } from '../common/utils/zone-normalization.util';

@Injectable()
export class SchoolService {
    constructor(
        @InjectModel(School.name) private schoolModel: Model<School>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Visit.name) private visitModel: Model<Visit>,
    ) { }

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

    async findAll(query: { page?: number, limit?: number, search?: string, zone?: string }) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (query.search) {
            filter.schoolName = { $regex: query.search, $options: 'i' };
        }
        if (query.zone) {
            filter.zone = normalizeZone(query.zone);
        }

        const [data, filteredCount, totalSchool, totalActiveSchool, totalSchoolUser] = await Promise.all([
            this.schoolModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.schoolModel.countDocuments(filter).exec(),
            this.schoolModel.countDocuments().exec(),
            this.schoolModel.countDocuments({ status: 'active' }).exec(),
            this.userModel.countDocuments(query.zone ? { assignedZone: normalizeZone(query.zone) } : {}).exec(),
        ]);

        return {
            success: true,
            message: 'Schools fetched successfully',
            data,
            totalSchool,
            totalActiveSchool,
            totalSchoolUser,
            pagination: {
                total: filteredCount,
                page,
                limit,
                pages: Math.ceil(filteredCount / limit),
            }
        };
    }

    async findOne(id: string) {
        const school = await this.schoolModel.findById(id).exec();
        if (!school) {
            throw new NotFoundException(`School with ID ${id} not found`);
        }

        const [orders, visits, totalCompleteVisit, totalPendingVisit] = await Promise.all([
            this.orderModel.find({ schoolId: id }).sort({ createdAt: -1 }).populate('userId', 'username').exec(),
            this.visitModel.find({ schoolId: id }).sort({ createdAt: -1 }).populate('userId', 'username').exec(),
            this.visitModel.countDocuments({ schoolId: id, status: 'completed' }),
            this.visitModel.countDocuments({ schoolId: id, status: 'pending' }),
        ]);

        const ordersCount = orders.length;
        const totalVisit = visits.length;

        // Determine last activity and next schedule date
        let lastActivity: Date | null = null;
        let nextScheduleDate: Date | null = school.scheduleVisitDate || null;

        if (visits.length > 0) {
            const latestVisit = visits[0];
            lastActivity = (latestVisit as any).createdAt as Date;

            // Check if there's a nextVisitDate in any of the details of the latest visit
            if (latestVisit.visitDetails && latestVisit.visitDetails.length > 0) {
                const latestDetail = latestVisit.visitDetails[latestVisit.visitDetails.length - 1];
                if (latestDetail.nextVisitDate) {
                    nextScheduleDate = latestDetail.nextVisitDate;
                }
            }
        }

        if (orders.length > 0) {
            const latestOrder = orders[0];
            if (!lastActivity || (latestOrder as any).createdAt > lastActivity) {
                lastActivity = (latestOrder as any).createdAt as Date;
            }
        }

        return {
            success: true,
            message: 'School fetched successfully',
            data: {
                ...school.toObject(),
                visitList: visits,
                orderList: orders,
                stats: {
                    ordersCount,
                    totalVisit,
                    totalCompleteVisit,
                    totalPendingVisit,
                    lastActivity,
                    nextScheduleDate,
                }
            },
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

    async getSchoolList() {
        const data = await this.schoolModel.find({}, '_id schoolName').exec();
        return {
            success: true,
            message: 'School list fetched successfully',
            data,
        };
    }
}
