import { notFoundError, unauthorizedError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import { FORBIDDEN } from "http-status";


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
    //Tem ticket pago isOnline false e includesHotel true
    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

    if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
        throw cannotListHotelsError();
    }

    const room = await bookingRepository.getRoomOfBookingByRoomId(roomId);

    if(room.capacity <= room.Booking.length){
        throw FORBIDDEN;
    }

    const bookingData = {
        userId,
        roomId,
    };

    const booking = await bookingRepository.createBooking(bookingData);

    
    return booking;
}

async function updateBooking(userId: number, roomId: number){
    const booking = await bookingRepository.getBookingByUserId(userId);
    if(!booking){
        throw FORBIDDEN;
    }

    const room = await bookingRepository.getRoomOfBookingByRoomId(roomId);

    if(room.capacity===0){
        throw FORBIDDEN;
    }

    const updatedBooking = await bookingRepository.updateRoomWithBookingId(booking.id, roomId);
    
    return updatedBooking;

}

const bookingService = {
    getBookingBody,
    createBooking,
    updateBooking
}

export default bookingService;