import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Attendance extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    date: Date; // Store as start of day (00:00:00)

    @Prop({ required: true, enum: ['present', 'absent', 'holiday'], default: 'present' })
    status: string;

    @Prop()
    loginTime: Date;

    @Prop()
    remarks: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Index for performance and to ensure unique attendance per user per day
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
