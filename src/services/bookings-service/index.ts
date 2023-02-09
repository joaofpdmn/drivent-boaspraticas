import { notFoundError, unauthorizedError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import { prisma } from "@prisma/client";


async function getBookingBody(userId: number) {
    const booking = await bookingRepository.getBookingByUserId(userId);
    if (!booking) {
        throw notFoundError();
    }
    const room = await bookingRepository.getRoomOfBookingByRoomId(booking.roomId);
    const body = {
        id: booking.id,
        Room: room,
    };
    return body;
}

async function createBooking(userId: number, roomId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
        throw unauthorizedError();
    }
    //Tem ticket pago isOnline false e includesHotel true
    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

    if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
        throw cannotListHotelsError();
    }

    const user = await bookingRepository.findUserByUserId(userId);
    if(!user){
        throw unauthorizedError();
    }

    const room = await bookingRepository.getRoomOfBookingByRoomId(roomId);
    if(!room){
        throw notFoundError();
    }
    if(room.capacity===0){
        throw unauthorizedError();
    }

    const bookingData = {
        user,
        userId,
        room,
        roomId,
    };

    const booking = await bookingRepository.createBooking(bookingData);
    
    return booking;
}


const bookingService = {
    getBookingBody,
    createBooking,
}

export default bookingService;