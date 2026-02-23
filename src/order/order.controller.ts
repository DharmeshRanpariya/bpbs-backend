import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Req,
    Query,
    Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { multerOptions } from '../common/utils/multer-options.util';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    @UseInterceptors(FileInterceptor('image', multerOptions))
    create(
        @UploadedFile() file: Express.Multer.File,
        @Body() createOrderDto: CreateOrderDto,
    ) {
        let imagePath = '';
        if (file) {
            imagePath = `/uploads/${file.filename}`;
        }

        // Special handling for orderItems if sent as string (multipart/form-data)
        if (typeof createOrderDto.orderItems === 'string') {
            try {
                createOrderDto.orderItems = JSON.parse(createOrderDto.orderItems);
            } catch (e) { }
        }

        return this.orderService.create(createOrderDto, imagePath);
    }

    @Get()
    findAll(@Query('search') search: string) {
        return this.orderService.findAll(search);
    }

    @Get('my-orders')
    getMyOrdersWithFilters(
        @Req() req: any,
        @Query('search') search: string,
        @Query('status') status: string,
    ) {
        const userId = req.user.userId;
        return this.orderService.getUserOrdersWithFilters(userId, search, status);
    }

    @Get('user-stats/me')
    getMyOrders(
        @Req() req: any,
        @Query('search') search: string
    ) {
        const userId = req.user.userId;
        return this.orderService.findByUserIdWithStats(userId, search);
    }

    @Get('export-my-orders')
    async exportMyOrders(@Req() req: any, @Res() res: Response) {
        const userId = req.user.userId;
        const buffer = await this.orderService.exportOrdersToExcel(userId);

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="my-orders.xlsx"',
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.orderService.findOne(id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('image', multerOptions))
    update(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() updateOrderDto: UpdateOrderDto,
    ) {
        let imagePath: string | undefined = undefined;
        if (file) {
            imagePath = `/uploads/${file.filename}`;
        }

        // Special handling for orderItems if sent as string (multipart/form-data)
        if (typeof updateOrderDto.orderItems === 'string') {
            try {
                updateOrderDto.orderItems = JSON.parse(updateOrderDto.orderItems);
            } catch (e) { }
        }

        return this.orderService.update(id, updateOrderDto, imagePath);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.orderService.remove(id);
    }

    @Post('record-payment')
    recordPayment(@Body() processPaymentDto: ProcessPaymentDto) {
        return this.orderService.processPayment(processPaymentDto);
    }
}
