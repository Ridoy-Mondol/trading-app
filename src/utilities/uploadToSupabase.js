import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export async function uploadFileToSupabase(
  file,
  bucketName = "Snipverse_uploads"
) {
  if (!file) throw new Error("No file provided");

  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${uuidv4()}.${ext}`;
  const filePath = `blog/${filename}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: publicData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicData.publicUrl;
}


















