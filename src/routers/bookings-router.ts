import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getBookings } from '@/controllers/bookings-controller';

const bookingsRouter = Router();

bookingsRouter
.all('/*', authenticateToken)
.get('/', getBookings)

export { bookingsRouter };