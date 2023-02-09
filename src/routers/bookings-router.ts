import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { createBooking, getBookings } from '@/controllers/bookings-controller';

const bookingsRouter = Router();

bookingsRouter
.all('/*', authenticateToken)
.get('/', getBookings)
.post('/', createBooking)

export { bookingsRouter };