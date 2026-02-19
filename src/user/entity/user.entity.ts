import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../common/enums/role.enum';

@Schema()
class OrderItem {
    @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
    orderId: Types.ObjectId;

    @Prop({ required: true, enum: ['Pending', 'Partial', 'Paid'], default: 'Pending' })
    paymentStatus: string;

    @Prop({ required: true, default: 0 })
    paymentAmount: number;

    @Prop({ required: true, default: 0 })
    paidAmount: number;

    @Prop({ required: true, default: 0 })
    dueAmount: number;

    @Prop()
    remarks: string;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema()
class UserOrderSummary {
    @Prop({ default: 0 })
    totalPayment: number;

    @Prop({ default: 0 })
    totalDuePayment: number;

    @Prop({ type: [OrderItemSchema], default: [] })
    items: OrderItem[];
}

const UserOrderSummarySchema = SchemaFactory.createForClass(UserOrderSummary);

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: Role.USER, enum: Role })
    role: Role;

    @Prop()
    phoneNumber: string;

    @Prop()
    profilePhoto: string;

    @Prop({ required: true })
    assignedZone: string;

    @Prop({ type: UserOrderSummarySchema, default: () => ({}) })
    orders: UserOrderSummary;

    @Prop()
    lastLogin: Date;

    @Prop({ default: 'active', enum: ['active', 'deactive'] })
    status: string;

    @Prop()
    fcmToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
