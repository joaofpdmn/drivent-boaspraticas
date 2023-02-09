import bookingService from "@/services/bookings-service";
import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";

export async function getBookings(req: AuthenticatedRequest, res: Response){
    const { userId } = req;
    try {
        const booking = await bookingService.getBookingBody(Number(userId));
        return res.status(httpStatus.OK).send(booking);
    } catch (error) {
        return res.sendStatus(httpStatus.NOT_FOUND);
    }
}

export async function createBooking(req: AuthenticatedRequest, res: Response){
    const { userId } = req;
    const { roomId } = req.body;
    if(!roomId){ return res.sendStatus(httpStatus.NOT_FOUND); }
    try {
        const booking = await bookingService.createBooking(Number(userId), Number(roomId));
        return res.status(httpStatus.OK).send(booking.id);
    } catch (error) {
        if(error.name==="NotFoundError"){
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        return res.sendStatus(403);
    }
}

export async function changeBooking(req: AuthenticatedRequest, res: Response){
    const { userId } = req;
    const { roomId } = req.body;
    if(!roomId){ return res.sendStatus(httpStatus.NOT_FOUND); }
    try {
        
    } catch (error) {
        
    }
}