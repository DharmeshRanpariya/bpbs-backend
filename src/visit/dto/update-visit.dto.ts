import { IsString, IsOptional, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class VisitDetailDto {
    @IsDateString()
    @IsOptional()
    date?: string;

    @IsString()
    @IsOptional()
    particulars?: string;

    @IsString()
    @IsOptional()
    remarks?: string;

    @IsDateString()
    @IsOptional()
    nextVisitDate?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    photo?: string;
}

export class UpdateVisitDto {
    @IsString()
    @IsOptional()
    userId?: string;

    @IsString()
    @IsOptional()
    schoolId?: string;

    @IsDateString()
    @IsOptional()
    scheduleDate?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => VisitDetailDto)
    visitDetails?: VisitDetailDto[];
}
