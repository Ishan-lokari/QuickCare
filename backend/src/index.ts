import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { getPrisma } from "./utils/getPrisma";

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

app.use(express.json());
app.use(cors());

const createHospitalLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
});

const verifyToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.hospitalId = (decoded as any).hospitalId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

app.post("/opd/join", async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    const { name, age, gender, phoneNo, symptoms, hospital } = req.body;

    const hospitalRecord = await prisma.hospital.findFirst({
      where: { name: hospital },
    });

    if (!hospitalRecord) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    const queueCount = await prisma.oPDQueue.count({
      where: { hospitalId: hospitalRecord.id },
    });

    if (queueCount >= hospitalRecord.maxQueueSize) {
      return res.status(400).json({ error: "Queue is full" });
    }

    await prisma.oPDQueue.create({
      data: {
        patientName: name,
        age,
        gender,
        phone: phoneNo.toString(),
        symptoms,
        hospitalId: hospitalRecord.id,
        queueNumber: queueCount + 1,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfully registered in queue" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/opd/latest", verifyToken, async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    const queue = await prisma.oPDQueue.findMany({
      where: { hospitalId: req.hospitalId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const formattedQueue = queue.map((q: any) => ({
      queueNo: `A${q.queueNumber.toString().padStart(3, "0")}`,
      name: q.patientName,
      waitTime: calculateWaitTime(q.queueNumber),
      status: q.status,
    }));

    return res.status(200).json(formattedQueue);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/bed/latest", verifyToken, async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    const bookings = await prisma.bedBooking.findMany({
      where: { hospitalId: req.hospitalId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const formattedBookings = bookings.map((b: any) => ({
      bedNo: b.bedNumber ? `A${b.bedNumber.toString().padStart(3, "0")}` : null,
      name: b.patientName,
      admissionDate: b.createdAt.toISOString().split("T")[0],
      status: b.status,
    }));

    return res.status(200).json(formattedBookings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/bed/book", async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    const { name, age, gender, phoneNo, reason, hospital } = req.body;

    const hospitalRecord = await prisma.hospital.findFirst({
      where: { name: hospital },
    });

    if (!hospitalRecord) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    const occupiedBeds = await prisma.bedBooking.count({
      where: {
        hospitalId: hospitalRecord.id,
        status: { in: ["pending", "approved"] },
      },
    });

    if (occupiedBeds >= hospitalRecord.maxBeds) {
      return res.status(400).json({ error: "No beds available" });
    }

    await prisma.bedBooking.create({
      data: {
        patientName: name,
        age,
        gender,
        phone: phoneNo.toString(),
        bedNumber: Math.random()*100,
        reason,
        hospitalId: hospitalRecord.id,
      },
    });

    return res.status(200).json({ message: "Successfully booked a bed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/admin/login", async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    const { email, password } = req.body;

    const hospital = await prisma.hospital.findUnique({
      where: { email },
    });

    if (!hospital || hospital.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ hospitalId: hospital.id }, JWT_SECRET, {
      expiresIn: "24h",
    });
    return res.status(200).json({ token , hospital: hospital.name });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/hospital", async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    const hospitals = await prisma.hospital.findMany({});
    return res.status(200).json({
      hospitals,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.post(
  "/hospital/create",
  createHospitalLimiter,
  async (req: any, res: any) => {
    try {
      const prisma = getPrisma();
      const { name, email, password } = req.query as {
        name: string;
        email: string;
        password: string;
      };

      const existingHospital = await prisma.hospital.findUnique({
        where: { email },
      });

      if (existingHospital) {
        return res.status(400).json({ error: "Hospital already exists" });
      }

      const hospital = await prisma.hospital.create({
        data: {
          name,
          email,
          password,
          maxQueueSize: 50,
          maxBeds: 100,
        },
      });

      const token = jwt.sign({ hospitalId: hospital.id }, JWT_SECRET, {
        expiresIn: "24h",
      });
      return res.status(200).json({
        message: "Admin created, go and login",
        token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.put("/opd/modify", verifyToken, async (req: any, res: any) => {
    try {
      const { queueNo, status } = req.body;
      const prisma = getPrisma();
      const queueNumber = parseInt(queueNo.slice(1));
      const hospitalId = req.hospitalId as string;

      if (status === "delete") {
        await prisma.oPDQueue.deleteMany({
          where: {
            AND: [
              { hospitalId: hospitalId },
              { queueNumber: queueNumber }
            ]
          }
        });
      } else if (status === "Completed") {
        await prisma.oPDQueue.updateMany({
          where: {
            AND: [
              { hospitalId: hospitalId },
              { queueNumber: queueNumber }
            ]
          },
          data: { status: status }
        });
      } else {
        return res.status(400).json({ error: "Invalid status" });
      }
  
      return res.status(200).json({ message: "success" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
});

app.put("/bed/modify", verifyToken, async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    const { bedNo, status } = req.body;
    const validStatuses = ["Occupied", "Available", "Reserved", "Maintainance"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await prisma.bedBooking.updateMany({
      where: {
        AND:[
            {hospitalId: req.hospitalId},
            {bedNumber: parseInt(bedNo)}
        ]
      },
      data: { status },
    });

    return res.status(200).json({ message: "success" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/hospital/info", verifyToken, async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    const hospital = await prisma.hospital.findUnique({
      where: { id: req.hospitalId },
      select: {
        name: true,
        email: true,
        maxQueueSize: true,
        maxBeds: true,
      },
    });

    const queueCount = await prisma.oPDQueue.count({
      where: {
        hospitalId: req.hospitalId,
        status: "waiting",
      },
    });

    const availableBeds = await prisma.bedBooking.count({
      where: {
        hospitalId: req.hospitalId,
      },
    });

    return res.status(200).json({
      ...hospital,
      currentStats: {
        patientsInQueue: queueCount,
        availableBeds: 50 - availableBeds,
        totalBeds: 50,
        averageWaitTime: `${queueCount * 15}m`,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});
function calculateWaitTime(queueNumber: number): string {
  const averageTimePerPatient = 15;
  const estimatedWait = queueNumber * averageTimePerPatient;
  return `${estimatedWait}mins`;
}

app.get('/',(req,res)=>{
  res.status(200).json({
    "message": "Welcome to the QuickCare Backend Service"
  })
})
// app.listen(3000, () => {
//   console.log("Server listening at port: 3000");
// });
export default app;