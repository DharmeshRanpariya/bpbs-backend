import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateSchoolDto {
    @IsString()
    @IsOptional()
    schoolName?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    contactPersonName?: string;

    @IsString()
    @IsOptional()
    contactNumber?: string;

    @IsString()
    @IsOptional()
    educationLimit?: string;

    @IsDateString()
    @IsOptional()
    scheduleVisitDate?: string;

    @IsString()
    @IsOptional()
    remark?: string;

    @IsString()
    @IsOptional()
    zone?: string;
}
