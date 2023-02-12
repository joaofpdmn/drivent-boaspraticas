import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { changeBooking, createBooking, getBookings } from '@/controllers/bookings-controller';

const bookingsRouter = Router();

bookingsRouter
.all('/*', authenticateToken)
.get('/', getBookings)
.post('/', createBooking)
.put('/:bookingId', changeBooking)

export { bookingsRouter };