import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class VisitDetail {
    @Prop({ required: true })
    date: Date;

    @Prop({ required: true })
    particulars: string;

    @Prop()
    remarks: string;

    @Prop()
    nextVisitDate: Date;

    @Prop({ required: true })
    location: string;

    @Prop()
    photo: string;
}

@Schema({ timestamps: true })
export class Visit extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'School', required: true })
    schoolId: Types.ObjectId;

    @Prop({ required: true })
    scheduleDate: Date;

    @Prop({
        enum: ['pending', 'rescheduled', 'completed'],
        default: 'pending'
    })
    status: string;

    @Prop({ type: [VisitDetail], default: [] })
    visitDetails: VisitDetail[];
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
