const { execSync } = require('child_process');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL or SUPABASE_KEY environment variables are not set.');
  process.exit(1);
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Please provide a migration file path as an argument.');
  process.exit(1);
}

const sqlContent = fs.readFileSync(migrationFile, 'utf8');

try {
  execSync(`echo "${sqlContent}" | npx supabase db push`, {
    env: {
      ...process.env,
      SUPABASE_DB_URL: supabaseUrl,
      SUPABASE_AUTH_TOKEN: supabaseKey,
    },
    stdio: 'inherit',
  });
  console.log('Migration executed successfully.');
} catch (error) {
  console.error('Error executing migration:', error);
  process.exit(1);
}
