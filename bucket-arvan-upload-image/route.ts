import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware } from "@/middlewares/decodeToken";
import images from "@/models/uploads";
import connectDB from "@/lib/db";

interface UploadResponse {
  success: boolean;
  url?: string;
  message?: string;
  error?: string;
  status?: number;
  images?: any[];
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

    const storeId = await roleMiddleware(token);
    if (typeof storeId !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    await connectDB();

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
      
      // Extract filename from objectName (remove "uploads/" prefix)
      const generatedFileName = objectName.split("/")[1];
      
      // Save to database
      const fileRecord = new images({
        imagesName: generatedFileName,
        imagesUrl: imageUrl,
        imagesType: contentType,
        imagesize: file.size,
        storeId: storeId,
      });
      
      await fileRecord.save();
      
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

export async function GET(
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

    const storeId = await roleMiddleware(token);
    if (typeof storeId !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const imagesList = await images.find({ storeId }).sort({ uploadDate: -1 });
    
    const formattedImages = imagesList.map(img => ({
      id: img._id.toString(),
      filename: img.imagesName,
      url: img.imagesUrl,
      uploadedAt: img.uploadDate,
      size: img.imagesize
    }));

    return NextResponse.json({
      success: true,
      images: formattedImages,
    });
  } catch (error) {
    console.error("Fetch images error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const storeId = await roleMiddleware(token);
    if (typeof storeId !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const { fileId } = await request.json();
    
    if (!fileId) {
      return NextResponse.json(
        { success: false, error: "File ID required" },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Find the file record
    const fileRecord = await images.findOne({ _id: fileId, storeId });
    
    if (!fileRecord) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    // Extract object name from URL for bucket deletion
    const url = fileRecord.imagesUrl;
    const objectName = url.split('/').slice(-2).join('/'); // gets "uploads/filename"
    
    const accessKey = process.env.ARVAN_ACCESS_KEY;
    const secretKey = process.env.ARVAN_SECRET_KEY;
    const bucketName = process.env.ARVAN_BUCKET_NAME || "mamad";

    if (!accessKey || !secretKey) {
      return NextResponse.json(
        { success: false, error: "Missing ArvanCloud credentials" },
        { status: 500 }
      );
    }

    // Delete from bucket
    const dateValue = new Date().toUTCString();
    const resource = `/${bucketName}/${objectName}`;
    const stringToSign = `DELETE\n\n\n${dateValue}\n${resource}`;
    
    const signature = crypto
      .createHmac("sha1", secretKey)
      .update(stringToSign)
      .digest("base64");

    const deleteUrl = `https://${bucketName}.s3.ir-thr-at1.arvanstorage.ir/${objectName}`;
    
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Host: `${bucketName}.s3.ir-thr-at1.arvanstorage.ir`,
        Date: dateValue,
        Authorization: `AWS ${accessKey}:${signature}`,
      },
    });

    // Delete from database regardless of bucket response
    await images.findByIdAndDelete(fileId);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}