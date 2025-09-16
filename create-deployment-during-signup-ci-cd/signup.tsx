import connect from "@/lib/data";
import { NextResponse, NextRequest } from "next/server";
import User from "@/models/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createDeployment } from "@/utilities/createNewDeployment";
import { initStore } from "@/utilities/createFolderDisk";

export async function POST(request: NextRequest) {
  console.log("Signup API hit");
  const { phoneNumber, password, title, storeId } = await request.json();

  try {
    await connect();
    console.log("Connected to DB");

    console.log("Starting deployment creation...");

    // IMPORTANT: Don't manually set replicas if you use HPA to auto-scale.
    // You can omit replicas here or set it to your HPA minReplicas (e.g., 2).
    const createNewDeployment = await createDeployment({
      name: `${title}-${storeId}`,                  // deployment name
      image: process.env.IMAGE_NAME || "",          // should be something like "wolfix1245/fastapi:1.1"
      // replicas: Number(process.env.REPLICAS) || 2, // optional, can omit for HPA auto-scaling
      namespace: process.env.NAMESPACE || "mamad",  // your k8s namespace
      storeId,
    });
    console.log("Deployment created:", createNewDeployment);

    const DeployedUrl = createNewDeployment.config?.host;
    // const DeployedUrl = `http://localhost:3002/`;
    if (!DeployedUrl) throw new Error("Deployment URL missing");

    const DiskUrl = `${process.env.VPS_URL}/${storeId}`

    console.log("Starting folder creation...");
    await initStore(storeId);

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating new user...");
    const newUser = new User({
      phoneNumber,
      password: hashedPassword,
      title,
      DeployedUrl,
      DiskUrl,
      storeId,
      trialDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
    });

    await newUser.save();
    console.log("User saved to DB");

    const token = jwt.sign(
      {
        id: newUser._id,
        storeId,
        DeployedUrl,
        DiskUrl
      },
      process.env.JWT_SECRET!,
      { expiresIn: "10000h" }
    );

    console.log("Signup successful");
    return NextResponse.json(
      {
        message: "User created successfully",
        token,
        userId: newUser._id,
        websiteUrl: DeployedUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        message: "Error creating user",
        error: error instanceof Error ? error.message : "Unknown error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connect();

    const users = await User.find();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}
