import { IsString, IsNotEmpty, IsNumber, IsMongoId, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessPaymentDto {
    @IsMongoId()
    @IsNotEmpty()
    orderId: string;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    receivedAmount: number;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    remainingAmount?: number;

    @IsString()
    @IsOptional()
    remarks?: string;
}
