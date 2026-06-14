import { supabase } from '@/games/card-battler/lib/supabaseClient';

export async function trackPackageById(trackingId) {
  const { data, error } = await supabase.rpc('track_package', {
    p_tracking_id: trackingId.trim(),
  });
  if (error) throw error;
  return data;
}

export async function fetchCustomers() {
  const { data, error } = await supabase
    .from('shipping_customers')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createCustomer({ name, email, phone }) {
  const { data, error } = await supabase
    .from('shipping_customers')
    .insert({ name, email: email || null, phone: phone || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchPackages() {
  const { data, error } = await supabase
    .from('packages')
    .select(`
      *,
      shipping_customers ( id, name, email, phone )
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPackage({ customerId, destinationAddress, status, notes }) {
  const { data, error } = await supabase
    .from('packages')
    .insert({
      customer_id: customerId,
      destination_address: destinationAddress,
      status: status ?? 'pending',
      notes: notes || null,
    })
    .select(`
      *,
      shipping_customers ( id, name, email, phone )
    `)
    .single();
  if (error) throw error;
  return data;
}

export async function updatePackageStatus(packageId, status, notes) {
  const { data, error } = await supabase.rpc('update_package_status', {
    p_package_id: packageId,
    p_status: status,
    p_notes: notes ?? null,
  });
  if (error) throw error;
  return data;
}
