import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ZoneController } from './zone.controller';
import { ZoneService } from './zone.service';
import { Zone, ZoneSchema } from './entity/zone.entity';
import { User, UserSchema } from '../user/entity/user.entity';
import { School, SchoolSchema } from '../school/entity/school.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Zone.name, schema: ZoneSchema },
            { name: User.name, schema: UserSchema },
            { name: School.name, schema: SchoolSchema },
        ]),
    ],
    controllers: [ZoneController],
    providers: [ZoneService],
    exports: [ZoneService],
})
export class ZoneModule { }
