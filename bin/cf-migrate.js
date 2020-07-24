const { exec } = require('child_process');

const instance_index = process.env.CF_INSTANCE_INDEX;

if (instance_index === '0') {
  const command = 'npm run db:migrate';

  exec(command, (err, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    if (err) console.log(err);
  });
}
