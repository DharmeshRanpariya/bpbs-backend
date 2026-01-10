import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/enums/role.enum';

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
}

export const UserSchema = SchemaFactory.createForClass(User);
