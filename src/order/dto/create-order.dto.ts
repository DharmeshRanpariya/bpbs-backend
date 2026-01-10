import { IsString, IsNotEmpty, IsOptional, IsNumber, IsMongoId, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderBookItemDto {
    @IsMongoId()
    @IsNotEmpty()
    bookId: string;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    price: number;
}

class OrderCategoryItemDto {
    @IsMongoId()
    @IsNotEmpty()
    categoryId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderBookItemDto)
    books: OrderBookItemDto[];
}

export class CreateOrderDto {
    @IsMongoId()
    @IsNotEmpty()
    userId: string;

    @IsMongoId()
    @IsNotEmpty()
    schoolId: string;

    @IsString()
    @IsNotEmpty()
    orderType: string;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    discount?: number;

    @IsString()
    @IsOptional()
    paymentTerms?: string;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    totalPayment: number;

    @IsString()
    @IsOptional()
    image?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderCategoryItemDto)
    orderItems: OrderCategoryItemDto[];
}
