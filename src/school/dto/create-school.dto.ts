import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateSchoolDto {
    @IsString()
    @IsNotEmpty()
    schoolName: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    contactPersonName: string;

    @IsString()
    @IsNotEmpty()
    contactNumber: string;

    @IsString()
    @IsNotEmpty()
    educationLimit: string;

    @IsDateString()
    @IsNotEmpty()
    scheduleVisitDate: string;

    @IsString()
    @IsOptional()
    remark?: string;

    @IsString()
    @IsNotEmpty()
    zone: string;
}
