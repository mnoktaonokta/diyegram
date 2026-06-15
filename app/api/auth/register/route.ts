import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import type { Gender } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/generated/prisma/client";

function parseGender(value: string | undefined): Gender | null {
  switch (value) {
    case "male":
      return "MALE";
    case "female":
      return "FEMALE";
    default:
      return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
      role?: string;
      gender?: string;
      dietitianId?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const name = body.name?.trim();
    const role = body.role;
    const gender = parseGender(body.gender);
    const dietitianId = body.dietitianId?.trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi girin" },
        { status: 400 },
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalı" },
        { status: 400 },
      );
    }

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "İsim en az 2 karakter olmalı" },
        { status: 400 },
      );
    }

    if (!gender) {
      return NextResponse.json(
        { error: "Cinsiyet seçimi zorunludur" },
        { status: 400 },
      );
    }

    let finalRole: Role;
    let assignedDietitianId: string | undefined;

    if (dietitianId) {
      const dietitian = await prisma.user.findFirst({
        where: {
          id: dietitianId,
          role: "DIETITIAN",
        },
        select: { id: true },
      });

      if (!dietitian) {
        return NextResponse.json(
          { error: "Geçersiz davet linki" },
          { status: 400 },
        );
      }

      finalRole = "CLIENT";
      assignedDietitianId = dietitian.id;
    } else {
      if (role !== "DIETITIAN" && role !== "CLIENT") {
        return NextResponse.json({ error: "Geçersiz hesap türü" }, { status: 400 });
      }

      finalRole = role as Role;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kayıtlı" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const nameParts = name.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] ?? name;
    const lastName = nameParts.slice(1).join(" ");

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: finalRole,
        gender,
        assignedDietitianId,
        avatarUrl: null,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu" },
      { status: 500 },
    );
  }
}
