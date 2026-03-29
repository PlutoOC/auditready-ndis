import { supabase } from '@/lib/supabase';

export async function getActiveOrganizationId(): Promise<string> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.org_id) {
    throw new Error('Organization not found for current user');
  }

  return data.org_id;
}
