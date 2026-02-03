import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './entity/notification.entity';

@Injectable()
export class NotificationService implements OnModuleInit {
    constructor(
        private configService: ConfigService,
        @InjectModel(Notification.name) private notificationModel: Model<Notification>
    ) { }

    onModuleInit() {
        try {
            const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');

            if (serviceAccountPath) {
                const absolutePath = path.isAbsolute(serviceAccountPath)
                    ? serviceAccountPath
                    : path.join(process.cwd(), serviceAccountPath);

                admin.initializeApp({
                    credential: admin.credential.cert(absolutePath),
                });
                console.log('Firebase Admin initialized successfully');
            } else {
                console.warn('FIREBASE_SERVICE_ACCOUNT_PATH not found in environment variables. Firebase notifications will not be sent.');
            }
        } catch (error) {
            console.error('Error initializing Firebase Admin:', error);
        }
    }

    async sendNotification(userId: string, token: string, title: string, body: string, data?: any) {
        if (!admin.apps.length) {
            console.warn('Firebase Admin not initialized. Skipping notification.');
            return;
        }

        const message = {
            notification: {
                title,
                body,
            },
            token: token,
            data: data || {},
        };

        try {
            const response = await admin.messaging().send(message);
            console.log('Successfully sent message:', response);

            // Store in DB
            await new this.notificationModel({
                userId,
                title,
                body,
                data,
                status: 'sent'
            }).save();

            return response;
        } catch (error) {
            console.error('Error sending message:', error);

            // Store failure in DB
            await new this.notificationModel({
                userId,
                title,
                body,
                data,
                status: 'failed',
                errorMessage: error.message
            }).save();

            throw error;
        }
    }
}
