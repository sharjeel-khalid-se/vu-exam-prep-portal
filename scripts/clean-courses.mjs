import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function main() {
  const slugs = ['cs201', 'cs304p', 'cs403p', 'cs301'];
  for (const slug of slugs) {
    try {
      const subRes = await turso.execute({
        sql: 'SELECT id FROM subjects WHERE slug = ?',
        args: [slug]
      });
      if (subRes.rows.length > 0) {
        const subId = subRes.rows[0].id;
        await turso.execute({
          sql: 'DELETE FROM questions WHERE lecture_id IN (SELECT id FROM lectures WHERE subject_id = ?)',
          args: [subId]
        });
        await turso.execute({
          sql: 'DELETE FROM lectures WHERE subject_id = ?',
          args: [subId]
        });
        await turso.execute({
          sql: 'DELETE FROM subjects WHERE id = ?',
          args: [subId]
        });
        console.log(`Deleted ${slug} from Turso.`);
      } else {
        console.log(`${slug} is already deleted from Turso.`);
      }
    } catch (err) {
      console.error(`Error deleting ${slug}:`, err.message);
    }
  }

  const remaining = await turso.execute('SELECT code, name FROM subjects ORDER BY code');
  console.log('\nCurrent Turso Subjects:');
  for (const r of remaining.rows) {
    console.log(` - ${r.code}: ${r.name}`);
  }
}

main().catch(console.error);
