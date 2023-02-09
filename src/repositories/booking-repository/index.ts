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

async function upsertBooking(bookingId: number, roomId: number, Room: string | number []){
    return prisma.booking.update({
        where: {
            id: bookingId,
        },
        data: {
            roomId: roomId,
            Room: room,
        }
    })
}

export type CreateBookingParams = Omit<Booking, "id" | "createdAt" | "updatedAt">;
export type UpdateBookingParams = Omit<Booking, "id" | "createdAt" | "updatedAt" | "User" | "userId" | >;

const bookingRepository = {
    getBookingByUserId,
    getRoomOfBookingByRoomId,
    createBooking,
    findUserByUserId
};


export default bookingRepository;