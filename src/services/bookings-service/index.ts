import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";


async function getBookingBody(userId: number){
    const booking  = await bookingRepository.getBookingByUserId(userId);
    if(!booking){
        throw notFoundError();
    }
    const room = await bookingRepository.getRoomOfBookingByRoomId(booking.roomId);
    const body = {
        id: booking.id,
        Room: room,
    };
    return body;
}

const bookingService = {
    getBookingBody,
}

export default bookingService;