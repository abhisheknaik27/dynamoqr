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
  { title, dynamic_url, static_url, user_id },
  qrcode
) {
  const shortUrl = static_url || Math.random().toString(36).substring(2, 10);
  const fileName = `qr-${shortUrl}`;

  const { error: storageError } = await supabase.storage
    .from("qrs")
    .upload(fileName, qrcode);

  if (storageError) {
    console.error(storageError.message);
    throw new Error(
      "Error uploading QR code. The short URL might already exist."
    );
  }

  const qr = `${supabaseUrl}/storage/v1/object/public/qrs/${fileName}`;

  const { data, error } = await supabase
    .from("urls")
    .insert([
      {
        title,
        static_url: shortUrl,
        dynamic_url,
        custom_url: null,
        user_id,
        qr,
      },
    ])
    .select();

  if (error) {
    console.error(error.message);
    await supabase.storage.from("qrs").remove([fileName]);
    throw new Error("Error creating short URL. It might already be taken.");
  }
  return data;
}

export async function getLongUrl(id) {
  const { data, error } = await supabase
    .from("urls")
    .select("id, dynamic_url")
    .or(`static_url.eq.${id},custom_url.eq.${id}`)
    .single();

  if (error) {
    console.error(error.message);
    throw new Error("Error fetching short link");
  }
  return data;
}

export async function getUrl({ id, user_id }) {
  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();
  if (error) {
    console.error(error);
    throw new Error("URL not found");
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

export async function updateUrl({ id, user_id, dynamic_url }) {
  console.log("Attempting to update URL with:", { id, user_id, dynamic_url });

  const { data, error } = await supabase
    .from("urls")
    .update({ dynamic_url })
    .eq("id", id)
    .eq("user_id", user_id)
    .select();

  if (error) {
    console.error(error.message);
    throw new Error("Unable to update URL");
  }

  // If no rows matched the filters, data will be an empty array
  if (!data || data.length === 0) {
    throw new Error("No matching URL found to update (id/user mismatch).");
  }

  console.log("Supabase update response:", data);
  return data;
}
