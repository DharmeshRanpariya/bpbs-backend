import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
class OrderBookItem {
    @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
    bookId: Types.ObjectId;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true })
    price: number;
}

const OrderBookItemSchema = SchemaFactory.createForClass(OrderBookItem);

@Schema()
class OrderCategoryItem {
    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    categoryId: Types.ObjectId;

    @Prop({ type: [OrderBookItemSchema], required: true })
    books: OrderBookItem[];
}

const OrderCategoryItemSchema = SchemaFactory.createForClass(OrderCategoryItem);

@Schema({ timestamps: true })
export class Order extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'School', required: true })
    schoolId: Types.ObjectId;

    @Prop({ required: true })
    orderType: string;

    @Prop({ default: 0 })
    discount: number;

    @Prop()
    paymentTerms: string;

    @Prop({ required: true })
    totalPayment: number;

    @Prop()
    image: string;

    @Prop({ default: 'Pending', enum: ['Pending', 'Completed', 'Cancelled'] })
    status: string;

    @Prop({ type: [OrderCategoryItemSchema], required: true })
    orderItems: OrderCategoryItem[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
