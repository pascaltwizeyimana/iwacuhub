// server/scripts/hashPassword.js
const bcrypt = require('bcrypt');

const password = 'Iwacu*123#';
const saltRounds = 12;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Password hash for "Iwacu*123#":');
    console.log(hash);
    console.log('\nUse this hash in your SQL INSERT statement');
});