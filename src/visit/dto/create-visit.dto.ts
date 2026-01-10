import { IsString, IsNotEmpty, IsDateString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class VisitDetailDto {
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsString()
    @IsNotEmpty()
    particulars: string;

    @IsString()
    @IsOptional()
    remarks?: string;

    @IsDateString()
    @IsOptional()
    nextVisitDate?: string;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsString()
    @IsOptional()
    photo?: string;
}

export class CreateVisitDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    schoolId: string;

    @IsDateString()
    @IsNotEmpty()
    scheduleDate: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => VisitDetailDto)
    visitDetails?: VisitDetailDto[];
}
