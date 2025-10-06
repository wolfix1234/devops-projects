import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import User from "@/models/users";
import Verification from "@/models/verification";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { vendorLogins, trackApiCall } from "@/lib/metrics-config";

export async function POST(request: NextRequest) {
  await connect();
  try {
    const { phoneNumber, password } = await request.json();


    if (!phoneNumber || !password) {
      return NextResponse.json(
        { message: "Phone number and password are required" },
        { status: 400 }
      );
    }

    // Check if phone is verified and not expired
    const verification = await Verification.findOne({ 
      phone: phoneNumber, 
      verified: true,
      expiresAt: { $gt: new Date() }
    });
    if (!verification) {
      return NextResponse.json({ message: "Phone verification expired or not verified" }, { status: 400 });
    }

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return NextResponse.json({ message: "نام کاربری یا رمز اشتباه هستند" }, { status: 401 });
    }

    if (!user || !user.password) {
      return NextResponse.json(
        { message: "User not found or password missing" },
        { status: 400 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    const tokenSecret = process.env.JWT_SECRET;

    if (!tokenSecret) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }


    

//     if (
//   user.type === "paidUser" ||
//   (user.type !== "paidUser" && Date.now() < new Date(user.trialDate).getTime())
// ) {
  const token = jwt.sign(
    {
      id: user._id,
      storeId: user.storeId,
      DeployedUrl: user.DeployedUrl,
    },
    tokenSecret,
    { expiresIn: "10000h" }
  );
  
  // Track successful login
  vendorLogins.inc({ vendor_id: user.storeId });
  trackApiCall('POST', '/api/auth/login', 200);
  
  return NextResponse.json({ token });
// }

// Trial expired case
// if (Date.now() > new Date(user.trialDate).getTime()) {
//   return NextResponse.json(
//     { message: "Your trial has expired" },
//     { status: 401 }
//   );
// }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
