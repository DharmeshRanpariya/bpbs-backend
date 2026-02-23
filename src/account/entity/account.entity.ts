import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Account extends Document {
    @Prop({ required: true })
    stNo: number;

    @Prop({ required: true })
    particulars: string;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true })
    no: string;

    @Prop({ default: 0 })
    dr: number;

    @Prop({ default: 0 })
    cr: number;

    @Prop({ required: true })
    amount: number;

    @Prop({ type: Types.ObjectId, ref: 'School', required: true })
    schoolId: Types.ObjectId;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
