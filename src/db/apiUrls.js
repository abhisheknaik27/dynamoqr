import supabase, { supabaseUrl } from "./supabase";

export async function getUrls(user_id) {
  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    console.error(error.message);
    throw new Error("Unable to Load URLs");
  }
  return data;
}

export async function createUrl(
  { title, staticUrl, dynamicUrl, customUrl, user_id },
  qrcode
) {
  const shortUrl = Math.random().toString(36).substring(2, 6);
  const fileName = `qr-${shortUrl}`;

  const { error: storageError } = await supabase.storage
    .from("qrs")
    .upload(fileName, qrcode);

  if (storageError) throw new Error(storageError.message);

  const qr = `${supabaseUrl}/storage/v1/object/public/qrs/${fileName}`;

  const { data, error } = await supabase
    .from("urls")
    .insert([
      {
        title,
        static_url: shortUrl,
        dynamic_url: dynamicUrl,
        custom_url: customUrl || null,
        user_id,
        qr,
      },
    ])
    .select();

  if (error) {
    console.error(error.message);
    throw new Error("Error creating short URL");
  }
  return data;
}

export async function deleteUrl(id) {
  const { data, error } = await supabase.from("urls").delete().eq("id", id);

  if (error) {
    console.error(error.message);
    throw new Error("Unable to Delete URL");
  }
  return data;
}
