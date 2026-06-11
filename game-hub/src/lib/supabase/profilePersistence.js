import { supabase } from './client';

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, screen_name, email, avatar_url, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[profile] fetch failed:', error.message);
    return null;
  }

  return data;
}

export async function updateScreenName(userId, screenName) {
  const trimmed = screenName.trim();

  const { data: available, error: lookupError } = await supabase.rpc(
    'is_screen_name_available',
    { p_screen_name: trimmed },
  );

  if (lookupError) {
    return { ok: false, error: lookupError.message };
  }

  if (available === false) {
    return { ok: false, error: 'That screen name is already taken.' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ screen_name: trimmed })
    .eq('id', userId)
    .select('id, screen_name, email, avatar_url, created_at')
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, profile: data };
}

export async function uploadAvatar(userId, file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
    .select('id, screen_name, email, avatar_url, created_at')
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, profile: data };
}
