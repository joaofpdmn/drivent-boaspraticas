import app, { init } from "@/app"
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { createEnrollmentWithAddress, createHotel, createPayment, createRoomWithHotelId, createRoomWithHotelIdAndNoCapacity, createTicket, createTicketType, createTicketTypeRemote, createTicketTypeWithHotel, createTicketTypeWithNoHotel, createUser } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import * as jwt from "jsonwebtoken";
import { TicketStatus } from "@prisma/client";
import { createBooking, updateRoom } from "../factories/bookings-factory";


beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/booking");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it("should responde with status 200 and bookingId with your Room", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);

            const booking = await createBooking(user.id, createdRoom.id);
            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual({
                id: booking.id,
                Room: {}
            });
        })

        it("should respond with 404 if user has no booking", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        })
    })

})

describe("POST /booking", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.post("/booking");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it("should respond with 404 if roomId is not existent", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        })

        it("should responde 403 if room is full", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelIdAndNoCapacity(createdHotel.id);
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: createdRoom.id});
            expect(response.status).toEqual(403);
        })

        it("should responde 403 if user doesn't have ticket", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: createdRoom.id});
            expect(response.status).toEqual(403);
        })

        it("should responde 403 if ticket isn't paid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: createdRoom.id});
            expect(response.status).toEqual(403);
        })

        it("should responde 403 if ticket type is remote", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: createdRoom.id});
            expect(response.status).toEqual(403);
        })
        it("should responde 403 if user doesn't includes hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithNoHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: createdRoom.id});
            expect(response.status).toEqual(403);
        })
        it("should responde 200 with roomId", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const createdBooking = await createBooking(user.id, createdRoom.id);
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: createdRoom.id});
            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual(createdBooking.id);
        })
    })


})

describe("PUT /booking/:bookingId", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.put("/booking/1");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    describe("when token is valid", () => {
        it("should respond with 404 if roomId is not existent", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const createdBooking = await createBooking(user.id, createdRoom.id);
            const response = await server.put(`/booking/${createdBooking.id}`).set("Authorization", `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        })

        it("should respond with 403 if room is full", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelIdAndNoCapacity(createdHotel.id);
            const createdBooking = await createBooking(user.id, createdRoom.id);
            const response = await server.put(`/booking/${createdBooking.id}`).set("Authorization", `Bearer ${token}`).send({roomId: createdRoom.id});
            expect(response.status).toEqual(403);
        })
        
        it("should respond with 403 if user has no booking", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const response = await server.put(`/booking/901239102391203813`).set("Authorization", `Bearer ${token}`).send({roomId: createdRoom.id});
            expect(response.status).toEqual(403);
        });
        
        it("should respond with 200 and bookingId", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const createdBooking = await createBooking(user.id, createdRoom.id);
            const updatedRoom = await updateRoom(createdBooking.id, createdRoom.id);
            
            const response = await server.put(`/booking/${createdBooking.id}`).set("Authorization", `Bearer ${token}`).send({roomId: createdRoom.id});
            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual(createdBooking.id);
        })
    })
})