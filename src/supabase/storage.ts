import { createClient } from "@/supabase/clients/browser";

export async function uploadFile(bucket: string, path: string, file: File) {
  const supabase = createClient();

  // RLS policy requires (storage.foldername(name))[1] = auth.uid()
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const storagePath = user ? `${user.id}/${path}` : path;

  const { data, error } = await supabase.storage.from(bucket).upload(storagePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;
  return data;
}

export async function deleteFile(bucket: string, paths: string[]) {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucket).remove(paths);

  if (error) throw error;
  return data;
}

export function getPublicUrl(bucket: string, path: string) {
  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}
