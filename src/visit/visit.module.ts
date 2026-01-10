import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VisitService } from './visit.service';
import { VisitController } from './visit.controller';
import { Visit, VisitSchema } from './entity/visit.entity';
import { SchoolModule } from '../school/school.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Visit.name, schema: VisitSchema }]),
        SchoolModule
    ],
    controllers: [VisitController],
    providers: [VisitService],
    exports: [VisitService]
})
export class VisitModule { }
