import { prisma } from '@/config';

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

const bookingRepository = {
    getBookingByUserId,
    getRoomOfBookingByRoomId,
};


export default bookingRepository;