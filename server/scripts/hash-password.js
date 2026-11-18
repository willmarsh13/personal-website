// Prints an ADMIN_PASSWORD_HASH for .env. The password is read without echoing.
const readline = require('readline');
const {hashPassword} = require('../api/admin/password');

function ask(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({input: process.stdin, output: process.stdout, terminal: true});
        rl._writeToOutput = (s) => { if (s.includes(question)) rl.output.write(s); };
        rl.question(question, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer); });
    });
}

(async () => {
    const password = process.argv[2] === '--stdin'
        ? require('fs').readFileSync(0, 'utf8').replace(/\r?\n$/, '')
        : await ask('Admin password: ');
    if (password.length < 12) {
        console.error('Use at least 12 characters (a passphrase is best).');
        process.exit(1);
    }
    if (process.argv[2] !== '--stdin' && (await ask('Confirm password: ')) !== password) {
        console.error('Passwords did not match.');
        process.exit(1);
    }
    console.log(`\nADMIN_PASSWORD_HASH=${hashPassword(password)}`);
})();
