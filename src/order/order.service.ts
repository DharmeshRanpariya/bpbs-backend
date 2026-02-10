import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './entity/order.entity';
import { User } from '../user/entity/user.entity';
import { Book } from '../book/entity/book.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Book.name) private bookModel: Model<Book>
    ) { }

    async create(createOrderDto: CreateOrderDto, imagePath?: string) {
        try {
            const newOrder = new this.orderModel({
                ...createOrderDto,
                image: imagePath || createOrderDto.image
            });
            const data = await newOrder.save();

            // Update User with the new order entry
            await this.userModel.findByIdAndUpdate(
                createOrderDto.userId,
                {
                    $inc: {
                        'orders.totalPayment': createOrderDto.totalPayment,
                        'orders.totalDuePayment': createOrderDto.totalPayment,
                    },
                    $push: {
                        'orders.items': {
                            orderId: data._id,
                            paymentStatus: 'Pending',
                            paymentAmount: createOrderDto.totalPayment,
                            paidAmount: 0,
                            dueAmount: createOrderDto.totalPayment,
                        },
                    },
                },
                { new: true }
            );

            // Update Book stock
            for (const item of createOrderDto.orderItems) {
                for (const bookItem of item.books) {
                    await this.bookModel.findByIdAndUpdate(
                        bookItem.bookId,
                        { $inc: { stock: -bookItem.quantity } }
                    );
                }
            }

            return {
                success: true,
                message: 'Order created successfully and stock updated',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while creating order',
                data: null,
            };
        }
    }

    async findAll() {
        try {
            const data = await this.orderModel.find()
                .populate('userId', 'username email')
                .populate('schoolId', 'schoolName address')
                .populate('orderItems.categoryId', 'name')
                .populate('orderItems.books.bookId', 'name price')
                .exec();
            const ordersWithStats = data.map(order => {
                const totalCategories = order.orderItems.length;
                const totalBooks = order.orderItems.reduce((acc, category) => {
                    return acc + category.books.reduce((sum, book) => sum + book.quantity, 0);
                }, 0);
                return {
                    ...order.toObject(),
                    totalCategories,
                    totalBooks
                };
            });

            return {
                success: true,
                message: 'Orders fetched successfully',
                data: ordersWithStats,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching orders',
                data: null,
            };
        }
    }

    async findOne(id: string) {
        try {
            const data = await this.orderModel.findById(id)
                .populate('userId', 'username email')
                .populate('schoolId', 'schoolName address')
                .populate('orderItems.categoryId', 'name')
                .populate('orderItems.books.bookId', 'name price')
                .exec();
            if (!data) {
                return {
                    success: false,
                    message: `Order with ID ${id} not found`,
                    data: null,
                };
            }
            const totalCategories = data.orderItems.length;
            const totalBooks = data.orderItems.reduce((acc, category) => {
                return acc + category.books.reduce((sum, book) => sum + book.quantity, 0);
            }, 0);

            return {
                success: true,
                message: 'Order fetched successfully',
                data: {
                    ...data.toObject(),
                    totalCategories,
                    totalBooks
                },
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching order',
                data: null,
            };
        }
    }

    async update(id: string, updateOrderDto: UpdateOrderDto, imagePath?: string) {
        try {
            const updateData: any = { ...updateOrderDto };
            if (imagePath) {
                updateData.image = imagePath;
            }

            const data = await this.orderModel.findByIdAndUpdate(id, updateData, { new: true })
                .populate('userId', 'username email')
                .populate('schoolId', 'schoolName address')
                .populate('orderItems.categoryId', 'name')
                .populate('orderItems.books.bookId', 'name price')
                .exec();
            if (!data) {
                return {
                    success: false,
                    message: `Order with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Order updated successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while updating order',
                data: null,
            };
        }
    }

    async remove(id: string) {
        try {
            const data = await this.orderModel.findByIdAndDelete(id).exec();
            if (!data) {
                return {
                    success: false,
                    message: `Order with ID ${id} not found`,
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Order deleted successfully',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while deleting order',
                data: null,
            };
        }
    }


    async findByUserIdWithStats(userId: string, search?: string) {
        try {
            console.log('findByUserIdWithStats - Incoming userId:', userId);
            let userObjectId: any = userId;
            if (Types.ObjectId.isValid(userId)) {
                userObjectId = new Types.ObjectId(userId);
            }
            const matchQuery: any = { userId: { $in: [userId, userObjectId] } };
            console.log('findByUserIdWithStats - matchQuery:', JSON.stringify(matchQuery));
            let orders;

            if (search) {
                // ... (existing search logic)
                const matchingOrders = await this.orderModel.aggregate([
                    { $match: matchQuery },
                    {
                        $lookup: {
                            from: 'schools',
                            localField: 'schoolId',
                            foreignField: '_id',
                            as: 'schoolInfo'
                        }
                    },
                    { $unwind: '$schoolInfo' },
                    {
                        $match: {
                            'schoolInfo.schoolName': { $regex: search, $options: 'i' }
                        }
                    },
                    { $project: { _id: 1 } }
                ]);

                const orderIds = matchingOrders.map(o => o._id);
                orders = await this.orderModel.find({ _id: { $in: orderIds } })
                    .populate('userId', 'username email')
                    .populate('schoolId', 'schoolName address')
                    .populate('orderItems.categoryId', 'name')
                    .populate('orderItems.books.bookId', 'name price')
                    .exec();
            } else {
                orders = await this.orderModel.find(matchQuery)
                    .populate('userId', 'username email')
                    .populate('schoolId', 'schoolName address')
                    .populate('orderItems.categoryId', 'name')
                    .populate('orderItems.books.bookId', 'name price')
                    .exec();
            }

            console.log(`findByUserIdWithStats - Found ${orders.length} orders`);

            if (orders.length === 0) {
                // System check for ANY order to see ID structure
                const anyOrder = await this.orderModel.findOne().lean().exec();
                if (anyOrder) {
                    console.log('Order System Check - RAW Order userId:', anyOrder.userId);
                    console.log('Order System Check - RAW Order userId type:', typeof anyOrder.userId);
                }
            }

            const totalOrders = orders.length;
            let pendingOrders = 0;
            let completedOrders = 0;
            let totalRevenue = 0;

            orders.forEach(order => {
                if (order.status === 'Pending') {
                    pendingOrders++;
                } else if (order.status === 'Completed') {
                    completedOrders++;
                }
                totalRevenue += order.totalPayment || 0;
            });

            const ordersWithStats = orders.map(order => {
                const totalCategories = order.orderItems.length;
                const totalBooks = order.orderItems.reduce((acc, category) => {
                    return acc + category.books.reduce((sum, book) => sum + book.quantity, 0);
                }, 0);
                return {
                    ...order.toObject(),
                    totalCategories,
                    totalBooks
                };
            });

            return {
                success: true,
                message: 'User orders and stats fetched successfully',
                data: {
                    orders: ordersWithStats,
                    stats: {
                        totalOrders,
                        pendingOrders,
                        completedOrders,
                        totalRevenue
                    }
                },
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while fetching user orders and stats',
                data: null,
            };
        }
    }

    async processPayment(processPaymentDto: ProcessPaymentDto) {
        try {
            const { orderId, receivedAmount, remarks } = processPaymentDto;

            const order = await this.orderModel.findById(orderId);
            if (!order) {
                return {
                    success: false,
                    message: 'Order not found',
                    data: null,
                };
            }

            const userDoc = await this.userModel.findOne({
                _id: order.userId,
                'orders.items.orderId': new Types.ObjectId(orderId)
            });

            if (!userDoc) {
                return {
                    success: false,
                    message: 'User or Order link in user profile not found',
                    data: null,
                };
            }
            const orderItem = userDoc.orders.items.find(
                item => item.orderId.toString() === orderId
            );

            if (!orderItem) {
                return {
                    success: false,
                    message: 'Order item not found in user summary',
                    data: null,
                };
            }

            const calculatedRemaining = (orderItem.dueAmount || 0) - receivedAmount;
            const paymentStatus = calculatedRemaining <= 0 ? 'Paid' : 'Partial';

            // 3. Update the User's payment summary and specific order item
            const user = await this.userModel.findOneAndUpdate(
                {
                    _id: order.userId,
                    'orders.items.orderId': new Types.ObjectId(orderId)
                },
                {
                    $set: {
                        'orders.items.$.paymentStatus': paymentStatus,
                        'orders.items.$.dueAmount': calculatedRemaining < 0 ? 0 : calculatedRemaining,
                        'orders.items.$.remarks': remarks,
                    },
                    $inc: {
                        'orders.items.$.paidAmount': receivedAmount,
                        'orders.totalDuePayment': -receivedAmount,
                    }
                },
                { new: true }
            );

            if (!user) {
                return {
                    success: false,
                    message: 'User or Order link in user profile not found',
                    data: null,
                };
            }

            if (paymentStatus === 'Paid') {
                await this.orderModel.findByIdAndUpdate(orderId, { status: 'Completed' });
            }

            return {
                success: true,
                message: 'Payment processed successfully',
                data: user.orders,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Error occurred while processing payment',
                data: null,
            };
        }
    }

    async getSchoolStats(schoolId: string) {
        try {
            let schoolObjectId: any = schoolId;
            if (Types.ObjectId.isValid(schoolId)) {
                schoolObjectId = new Types.ObjectId(schoolId);
            }

            const schoolMatchQuery = { $in: [schoolId, schoolObjectId] };
            const orders = await this.orderModel.find({ schoolId: schoolMatchQuery }).exec();

            let totalBooks = 0;
            const categoryIds = new Set();
            const bookIds = new Set();

            orders.forEach(order => {
                order.orderItems.forEach(item => {
                    categoryIds.add(item.categoryId.toString());
                    item.books.forEach(book => {
                        bookIds.add(book.bookId.toString());
                        totalBooks += book.quantity;
                    });
                });
            });

            return {
                totalOrders: orders.length,
                totalBooks, // total quantity
                uniqueBooks: bookIds.size,
                totalCategories: categoryIds.size
            };
        } catch (error) {
            console.error('Error in getSchoolStats:', error);
            return {
                totalOrders: 0,
                totalBooks: 0,
                uniqueBooks: 0,
                totalCategories: 0
            };
        }
    }
}
