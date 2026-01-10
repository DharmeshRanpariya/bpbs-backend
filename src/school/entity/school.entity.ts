import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class School extends Document {
    @Prop({ required: true })
    schoolName: string;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    contactPersonName: string;

    @Prop({ required: true })
    contactNumber: string;

    @Prop({ required: true })
    educationLimit: string;

    @Prop({ required: true })
    scheduleVisitDate: Date;

    @Prop()
    remark: string;

    @Prop({ required: true })
    zone: string;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
