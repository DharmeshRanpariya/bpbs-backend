import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    stNo: number;

    @ApiProperty({ example: 'Sales' })
    @IsNotEmpty()
    @IsString()
    particulars: string;

    @ApiProperty({ example: '2025-11-01' })
    @IsNotEmpty()
    @IsDateString()
    date: Date;

    @ApiProperty({ example: '777' })
    @IsNotEmpty()
    @IsString()
    no: string;

    @ApiProperty({ example: 10000, required: false })
    @IsOptional()
    @IsNumber()
    dr?: number;

    @ApiProperty({ example: 0, required: false })
    @IsOptional()
    @IsNumber()
    cr?: number;

    @ApiProperty({ example: 10000 })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({ example: '60d5f2f5f1b2c3a4e5f67890' })
    @IsNotEmpty()
    @IsMongoId()
    schoolId: string;
}
