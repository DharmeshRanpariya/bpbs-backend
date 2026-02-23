import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account } from './entity/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AccountService {
    constructor(@InjectModel(Account.name) private accountModel: Model<Account>) { }

    async create(createAccountDto: CreateAccountDto): Promise<Account> {
        const createdAccount = new this.accountModel(createAccountDto);
        return createdAccount.save();
    }

    async createBulk(file: Express.Multer.File, schoolId: string): Promise<Account[]> {
        const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const accounts = data
            .filter((row: any) => row['Particulars'] || row['particulars'] || row['SI No.'] || row['SI No']) // Filter out empty-looking rows
            .map((row: any) => {
                // Mapping excel columns to entity fields
                // User provided: SI No., Particulars, Date, NO., Dr, Cr, Amount
                return {
                    stNo: row['SI No.'] || row['SI No'] || row['stNo'] || row['stno'],
                    particulars: row['Particulars'] || row['particulars'],
                    date: row['Date'] ? new Date(row['Date']) : new Date(),
                    no: String(row['NO.'] || row['No'] || row['no'] || ''),
                    dr: Number(row['Dr'] || row['dr'] || 0),
                    cr: Number(row['Cr'] || row['cr'] || 0),
                    amount: Number(row['Amount'] || row['amount'] || 0),
                    schoolId: new Types.ObjectId(schoolId),
                };
            });

        return this.accountModel.insertMany(accounts) as any;
    }

    async findAllBySchool(schoolId: string): Promise<Account[]> {
        return this.accountModel.find({ schoolId: new Types.ObjectId(schoolId) }).sort({ stNo: 1 }).exec();
    }

    async remove(id: string): Promise<any> {
        return this.accountModel.findByIdAndDelete(id).exec();
    }
}
