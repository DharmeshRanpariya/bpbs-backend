import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async create(createUserDto: CreateUserDto, profilePhotoPath?: string) {
        try {
            const newUser = new this.userModel({
                ...createUserDto,
                profilePhoto: profilePhotoPath,
            });
            const data = await newUser.save();
            return {
                success: true,
                message: 'User created successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while creating user',
                data: null,
            };
        }
    }

    async findAll() {
        try {
            const data = await this.userModel.find().exec();
            return {
                success: true,
                message: 'Users fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching users',
                data: null,
            };
        }
    }

    async findOne(id: string) {
        try {
            const data = await this.userModel.findById(id).exec();
            if (!data) {
                return {
                    success: false,
                    message: `User with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'User fetched successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching user',
                data: null,
            };
        }
    }

    async update(id: string, updateUserDto: any, profilePhotoPath?: string) {
        try {
            const updateData = { ...updateUserDto };
            if (profilePhotoPath) {
                updateData.profilePhoto = profilePhotoPath;
            }
            const data = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
            if (!data) {
                return {
                    success: false,
                    message: `User with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'User updated successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while updating user',
                data: null,
            };
        }
    }

    async remove(id: string) {
        try {
            const data = await this.userModel.findByIdAndDelete(id).exec();
            if (!data) {
                return {
                    success: false,
                    message: `User with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'User deleted successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while deleting user',
                data: null,
            };
        }
    }
}
