import { prisma } from '@/config';
import { Booking } from '@prisma/client';

async function getBookingByUserId(userId: number){
    return prisma.booking.findFirst({
        where: {
            userId: userId,
        }
    });
}

async function getRoomOfBookingByRoomId(roomId: number){
    return prisma.room.findFirst({
        where: {
            id: roomId,
        }, include: {
            Booking: true,
        }
    });
}

async function createBooking(booking: CreateBookingParams){
    return prisma.booking.create({
        data: {
            ...booking,
        }
    });
}

async function findUserByUserId(userId: number){
    return prisma.user.findFirst({
        where: {
            id: userId,
        }
    });
}

async function updateRoomWithBookingId(bookingId: number, roomId: number){
    return prisma.booking.update({
        where: {
            id: bookingId,
        },
        data: {
            roomId: roomId,
        }
    })
}

export type CreateBookingParams = Omit<Booking, "id" | "createdAt" | "updatedAt">;

const bookingRepository = {
    getBookingByUserId,
    getRoomOfBookingByRoomId,
    createBooking,
    findUserByUserId,
    updateRoomWithBookingId
};


export default bookingRepository;