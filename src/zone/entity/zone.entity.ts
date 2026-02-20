import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Zone extends Document {
    @Prop({ required: true, unique: true })
    name: string;
}

export const ZoneSchema = SchemaFactory.createForClass(Zone);
