import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Book extends Document {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    class: string;

    @Prop()
    pages: number;

    @Prop({ required: true })
    price: number;

    @Prop()
    video: string;

    @Prop()
    coverImage: string;

    @Prop()
    pdf: string;

    @Prop()
    stock: number;

    @Prop()
    author: string;

    @Prop()
    ISBN: string;

    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    category: Types.ObjectId;
}

export const BookSchema = SchemaFactory.createForClass(Book);
