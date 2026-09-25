import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(file.name);
    if (!isImage) {
      return NextResponse.json({ error: "Please upload an image file (PNG, JPG, WEBP, etc.)" }, { status: 400 });
    }

    const sanitizedBase = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `coord-${Date.now()}-${sanitizedBase}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let fileUrl = "";

    // 1. Try uploading to Supabase Storage bucket 'gallery' or 'coordinators'
    try {
      const db = supabaseAdmin();
      const { error: uploadError } = await db.storage
        .from("gallery")
        .upload(`coordinators/${uniqueFileName}`, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = db.storage.from("gallery").getPublicUrl(`coordinators/${uniqueFileName}`);
        if (publicUrlData?.publicUrl) {
          fileUrl = publicUrlData.publicUrl;
        }
      } else {
        console.warn("Supabase storage upload error for coordinator photo:", uploadError);
      }
    } catch (err) {
      console.warn("Supabase storage exception for coordinator photo, falling back to local storage:", err);
    }

    // 2. Fallback to local /public/uploads/coordinators if Supabase storage was not reachable
    if (!fileUrl) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "coordinators");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localFilePath = path.join(uploadsDir, uniqueFileName);
      fs.writeFileSync(localFilePath, buffer);
      fileUrl = `/uploads/coordinators/${uniqueFileName}`;
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error("Coordinator photo upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload coordinator profile photo" },
      { status: 500 }
    );
  }
}
