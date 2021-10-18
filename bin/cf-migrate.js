const util = require('util');
const exec = util.promisify(require('child_process').exec);

const instance_index = process.env.CF_INSTANCE_INDEX;

async function runMigrations() {
  try {
    const command = 'npm run db:migrate';
    const { stdout, stderr } = await exec(command);
    if (stdout) {
      console.log('stdout', stdout);
      process.exit(0);
    }
    if (stderr) {
      console.log('stderr', stderr);
      process.exit(1);
    }
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
    process.exit(1);
  }
}

if (instance_index === '0') {
  runMigrations();
}
