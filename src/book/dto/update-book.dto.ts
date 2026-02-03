import { IsString, IsOptional, IsNumber, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBookDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    class?: string;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    pages?: number;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    price?: number;

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
    @IsOptional()
    category?: string;
}
