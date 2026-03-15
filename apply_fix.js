const { createClient } = require('./node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://lwvojuecaunctwofxkzq.supabase.co';
const supabaseKey = 'sbp_5b8cfd1f7e811f4e104c5d8dfa7613fd32f0cb23';

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
-- Create function to handle new auth users
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, is_active, created_at, updated_at)
    VALUES (NEW.id, NEW.email, 'user', TRUE, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record when a new auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- Users can view their own record (needed before org_id is set)
DROP POLICY IF EXISTS "Users can view own record" ON users;
CREATE POLICY "Users can view own record" ON users
    FOR SELECT USING (
        id = auth.uid()
    );

-- Users can insert their own record (needed during signup)
DROP POLICY IF EXISTS "Users can insert own record" ON users;
CREATE POLICY "Users can insert own record" ON users
    FOR INSERT WITH CHECK (
        id = auth.uid()
    );
`;

async function applySQL() {
  try {
    // Use the rpc function to execute SQL if available
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error applying SQL:', error);
      process.exit(1);
    }
    
    console.log('SQL applied successfully:', data);
  } catch (err) {
    console.error('Exception:', err);
    process.exit(1);
  }
}

applySQL();
