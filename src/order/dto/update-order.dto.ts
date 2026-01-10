import { IsString, IsOptional, IsNumber, IsMongoId, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderBookItemDto {
    @IsMongoId()
    @IsOptional()
    bookId?: string;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    quantity?: number;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    price?: number;
}

class OrderCategoryItemDto {
    @IsMongoId()
    @IsOptional()
    categoryId?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => OrderBookItemDto)
    books?: OrderBookItemDto[];
}

export class UpdateOrderDto {
    @IsMongoId()
    @IsOptional()
    userId?: string;

    @IsMongoId()
    @IsOptional()
    schoolId?: string;

    @IsString()
    @IsOptional()
    orderType?: string;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    discount?: number;

    @IsString()
    @IsOptional()
    paymentTerms?: string;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    totalPayment?: number;

    @IsString()
    @IsOptional()
    image?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => OrderCategoryItemDto)
    orderItems?: OrderCategoryItemDto[];
}
