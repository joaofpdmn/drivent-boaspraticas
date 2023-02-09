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