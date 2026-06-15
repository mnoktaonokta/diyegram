import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../lib/generated/prisma/client";

dotenv.config({ override: true });

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TEST_PASSWORD = "123456";

async function main() {
  const password = await bcrypt.hash(TEST_PASSWORD, 12);

  const dietitian = await prisma.user.upsert({
    where: { email: "diyetisyen@diyegram.com" },
    update: {
      firstName: "Ayşe",
      lastName: "Yılmaz",
      password,
      role: "DIETITIAN",
      professionalTitle: "Klinik Beslenme Uzmanı",
      bio: "Danışanlarına sürdürülebilir beslenme alışkanlıkları kazandırmayı hedefleyen klinik diyetisyen.",
      avatarUrl:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    },
    create: {
      email: "diyetisyen@diyegram.com",
      password,
      firstName: "Ayşe",
      lastName: "Yılmaz",
      role: "DIETITIAN",
      age: 38,
      height: 168,
      gender: "FEMALE",
      professionalTitle: "Klinik Beslenme Uzmanı",
      bio: "Danışanlarına sürdürülebilir beslenme alışkanlıkları kazandırmayı hedefleyen klinik diyetisyen.",
      avatarUrl:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    },
  });

  await prisma.user.upsert({
    where: { email: "danisan@diyegram.com" },
    update: {
      firstName: "Mehmet",
      lastName: "Demir",
      password,
      role: "CLIENT",
      assignedDietitianId: dietitian.id,
      age: 32,
      height: 175,
      gender: "MALE",
      programStartedAt: new Date("2026-03-14"),
      startWeight: 88,
      startFatPercentage: 28.5,
      previousWeight: 83.6,
      previousFatPercentage: 25.3,
      currentWeight: 82.4,
      currentFatPercentage: 24.8,
      targetWeight: 78,
      targetFatPercentage: 22,
      nextAppointmentDate: new Date("2026-06-15"),
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    create: {
      email: "danisan@diyegram.com",
      password,
      firstName: "Mehmet",
      lastName: "Demir",
      role: "CLIENT",
      assignedDietitianId: dietitian.id,
      age: 32,
      height: 175,
      gender: "MALE",
      programStartedAt: new Date("2026-03-14"),
      startWeight: 88,
      startFatPercentage: 28.5,
      previousWeight: 83.6,
      previousFatPercentage: 25.3,
      currentWeight: 82.4,
      currentFatPercentage: 24.8,
      targetWeight: 78,
      targetFatPercentage: 22,
      nextAppointmentDate: new Date("2026-06-15"),
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
  });

  console.log("Seed tamamlandı:");
  console.log(`  Diyetisyen: diyetisyen@diyegram.com / ${TEST_PASSWORD}`);
  console.log(`  Danışan:    danisan@diyegram.com / ${TEST_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
