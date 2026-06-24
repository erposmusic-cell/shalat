import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (username === adminUsername && password === adminPassword) {
      const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");
      return NextResponse.json({
        success: true,
        token,
        user: { username, name: "Administrator" },
      });
    }

    return NextResponse.json({ success: false, message: "Username atau password salah" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }
}
