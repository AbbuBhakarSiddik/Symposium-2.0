import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
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
    const title = String(formData.get("title") || "").trim();
    const caption = String(formData.get("caption") || "").trim();

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|ogg|mkv)$/i.test(file.name);
    const mediaType: "photo" | "video" = isVideo ? "video" : "photo";

    const sanitizedBase = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}-${sanitizedBase}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let fileUrl = "";

    // 1. Try uploading to Supabase Storage bucket 'gallery'
    try {
      const db = supabaseAdmin();
      const { error: uploadError } = await db.storage
        .from("gallery")
        .upload(uniqueFileName, buffer, {
          contentType: file.type || (isVideo ? "video/mp4" : "image/jpeg"),
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = db.storage.from("gallery").getPublicUrl(uniqueFileName);
        if (publicUrlData?.publicUrl) {
          fileUrl = publicUrlData.publicUrl;
        }
      } else {
        console.warn("Supabase storage upload error:", uploadError);
      }
    } catch (err) {
      console.warn("Supabase storage exception, falling back to public/uploads:", err);
    }

    // 2. Fallback to local /public/uploads if Supabase storage was not reachable
    if (!fileUrl) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localFilePath = path.join(uploadsDir, uniqueFileName);
      fs.writeFileSync(localFilePath, buffer);
      fileUrl = `/uploads/${uniqueFileName}`;
    }

    // 3. Insert record into Supabase 'gallery' table
    const db = supabaseAdmin();
    const finalTitle = title || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const { data: insertedItem, error: insertError } = await db
      .from("gallery")
      .insert({
        type: mediaType,
        url: fileUrl,
        title: finalTitle,
        caption: caption || "",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Gallery DB insert error:", insertError);
      throw insertError;
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      url: fileUrl,
      type: mediaType,
      item: insertedItem,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error("Gallery upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
