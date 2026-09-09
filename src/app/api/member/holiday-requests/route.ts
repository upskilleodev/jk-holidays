import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";
import { HolidayRequest } from "@/models/HolidayRequest";

const travellerSchema = z.object({
  name: z.string().trim().max(80).default(""),
  age: z.string().trim().max(10).default(""),
  gender: z.string().trim().max(20).default(""),
  mobile: z.string().trim().max(20).default(""),
  idType: z.string().trim().max(40).default(""),
  idNumber: z.string().trim().max(40).default(""),
});

const createSchema = z.object({
  destination: z.string().trim().min(2).max(80),
  resort: z.string().trim().max(120).default(""),
  checkIn: z.string().trim().min(4).max(40),
  checkOut: z.string().trim().min(4).max(40),
  nightsLabel: z.string().trim().max(40).default(""),
  rooms: z.string().trim().max(40).default("1 Room"),
  arrival: z.string().trim().max(40).default(""),
  departure: z.string().trim().max(40).default(""),
  airportPickup: z.string().trim().max(10).default("No"),
  sightseeing: z.string().trim().max(10).default("No"),
  travellers: z.array(travellerSchema).max(12).default([]),
  mealPreference: z.string().trim().max(40).default(""),
  celebration: z.string().trim().max(10).default("No"),
  wheelchair: z.string().trim().max(10).default("No"),
  specialRequests: z.string().trim().max(1000).default(""),
});

async function nextRequestId() {
  const count = await HolidayRequest.countDocuments();
  return `JK${10000 + count + 1}`;
}

export async function GET() {
  try {
    const session = await getMemberSession();
    if (!session) return jsonError("Unauthorized", 401);
    await connectDB();

    const requests = await HolidayRequest.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .lean();

    return jsonOk({ requests });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getMemberSession();
    if (!session) return jsonError("Unauthorized", 401);

    const body = createSchema.parse(await request.json());
    await connectDB();

    let requestId = await nextRequestId();
    while (await HolidayRequest.findOne({ requestId })) {
      requestId = `JK${Math.floor(10000 + Math.random() * 90000)}`;
    }

    const doc = await HolidayRequest.create({
      ...body,
      requestId,
      userId: session.userId,
      status: "pending",
    });

    return jsonOk({ request: doc }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input");
    }
    return handleRouteError(error);
  }
}
