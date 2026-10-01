// server/scripts/setPassword.js
// CLI helper to set a new bcrypt password for any user account.
// Usage: node scripts/setPassword.js <email> <newPassword>

const bcrypt = require('bcryptjs');
const { query, pool } = require('../src/config/db');
const config = require('../src/config/config');

async function setPassword() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/setPassword.js <email> <newPassword>');
    process.exit(1);
  }

  const [rawEmail, newPassword] = args;
  const email = rawEmail.toLowerCase().trim();

  if (newPassword.length < 8 || newPassword.length > 72) {
    console.error('Error: Password must be between 8 and 72 characters.');
    process.exit(1);
  }

  try {
    const userRes = await query('SELECT id, email, name, role FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      console.error(`Error: User with email "${email}" was not found.`);
      process.exit(1);
    }

    const user = userRes.rows[0];
    const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    await query(
      `UPDATE users
       SET password_hash = $1
       WHERE email = $2`,
      [passwordHash, email]
    );

    console.log(`✅ Success: Password updated for ${user.name} (${user.email}) [Role: ${user.role}].`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating password:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setPassword();
