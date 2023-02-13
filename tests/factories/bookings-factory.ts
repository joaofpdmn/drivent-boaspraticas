import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createBooking(userId: number, roomId: number) {
    return await prisma.booking.create({
        data: {
            userId: userId,
            roomId: roomId,
        }
    });
}

export async function updateRoom(bookingId: number, roomId: number){
    return prisma.booking.update({
        where: {
            id: bookingId,
        },
        data: {
            roomId: roomId,
        }
    })
}