import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lwvojuecaunctwofxkzq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3dm9qdWVjYXVuY3R3b2Z4a3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NTkwMTAsImV4cCI6MjA4OTAzNTAxMH0.PM_b9zUrtFpR2mw9I_ogq17jrO0BNgiwTQfQSuEq2JE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const results = {
  auth: null,
  buckets: null,
  bucketChecks: {},
  upload: null,
};

async function run() {
  // 1. Authentication (anonymous sign-in)
  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    results.auth = {
      success: !error,
      error: error?.message ?? null,
      user: data?.user ?? null,
      session: {
        access_token: data?.session?.access_token ? '[received]' : null,
        expires_at: data?.session?.expires_at ?? null,
      },
    };
  } catch (err) {
    results.auth = { success: false, error: err.message };
  }

  // 2. List storage buckets
  try {
    const { data, error } = await supabase.storage.listBuckets();
    results.buckets = {
      success: !error,
      error: error?.message ?? null,
      buckets: data?.map((b) => ({ id: b.id, name: b.name, public: b.public })) ?? null,
    };
  } catch (err) {
    results.buckets = { success: false, error: err.message };
  }

  // 2b. Probe evidence buckets directly
  for (const bucketName of ['evidence', 'evidence-files']) {
    try {
      const { data, error } = await supabase.storage.from(bucketName).list('', { limit: 5 });
      results.bucketChecks[bucketName] = {
        success: !error,
        error: error?.message ?? null,
        sample: data?.map((item) => ({ name: item.name, id: item.id, updated_at: item.updated_at })) ?? null,
      };
    } catch (err) {
      results.bucketChecks[bucketName] = { success: false, error: err.message };
    }
  }

  // 3. Upload test file to 'evidence'
  try {
    const content = new TextEncoder().encode(`Test upload at ${new Date().toISOString()} by automated script`);
    const path = `test-uploads/subagent-${Date.now()}.txt`;
    const { data, error } = await supabase.storage
      .from('evidence')
      .upload(path, content, {
        contentType: 'text/plain',
        upsert: false,
      });

    results.upload = {
      success: !error,
      error: error?.message ?? null,
      path: data?.path ?? null,
      bucketId: data?.bucket_id ?? null,
      fullPath: data?.fullPath ?? null,
    };
  } catch (err) {
    results.upload = { success: false, error: err.message };
  }

  console.dir(results, { depth: null });
}

run();
