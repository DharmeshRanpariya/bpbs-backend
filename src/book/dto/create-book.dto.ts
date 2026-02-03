import { IsString, IsNotEmpty, IsOptional, IsNumber, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    class: string;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    pages?: number;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    price: number;

    @IsString()
    @IsOptional()
    video?: string;

    @IsString()
    @IsOptional()
    coverImage?: string;

    @IsString()
    @IsOptional()
    pdf?: string;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    stock?: number;

    @IsString()
    @IsOptional()
    author?: string;

    @IsString()
    @IsOptional()
    ISBN?: string;

    @IsMongoId()
    @IsNotEmpty()
    category: string;
}
