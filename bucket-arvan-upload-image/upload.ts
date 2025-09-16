import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

interface UploadResponse {
  success: boolean;
  url?: string;
  message?: string;
  error?: string;
  status?: number;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<UploadResponse>> {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication token required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const accessKey = process.env.ARVAN_ACCESS_KEY;
    const secretKey = process.env.ARVAN_SECRET_KEY;
    const bucketName = process.env.ARVAN_BUCKET_NAME || "mamad";

    if (!accessKey || !secretKey) {
      return NextResponse.json(
        { success: false, error: "Missing ArvanCloud credentials" },
        { status: 500 }
      );
    }

    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString("hex");
    const extension = file.name.split(".").pop();
    const objectName = `uploads/${timestamp}-${randomString}.${extension}`;

    const fileContent = await file.arrayBuffer();

    const dateValue = new Date().toUTCString();
    const contentType = file.type || "application/octet-stream";
    const resource = `/${bucketName}/${objectName}`;

    const stringToSign = `PUT\n\n${contentType}\n${dateValue}\nx-amz-acl:public-read\n${resource}`;

    const signature = crypto
      .createHmac("sha1", secretKey)
      .update(stringToSign)
      .digest("base64");

    const uploadUrl = `https://${bucketName}.s3.ir-thr-at1.arvanstorage.ir/${objectName}`;

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Host: `${bucketName}.s3.ir-thr-at1.arvanstorage.ir`,
        Date: dateValue,
        "Content-Type": contentType,
        "Content-Length": fileContent.byteLength.toString(),
        "x-amz-acl": "public-read",
        Authorization: `AWS ${accessKey}:${signature}`,
      },
      body: fileContent,
    });

    if (response.ok) {
      const imageUrl = `https://${bucketName}.s3.ir-thr-at1.arvanstorage.ir/${objectName}`;
      return NextResponse.json({
        success: true,
        url: imageUrl,
        message: "File uploaded successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to upload to ArvanCloud",
          status: response.status,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}