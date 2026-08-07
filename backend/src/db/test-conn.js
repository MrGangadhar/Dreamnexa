const { Client } = require('pg');
async function testConn() {
  const passwords = ['postgres', 'admin', 'root', 'quizarena_pass', 'dreamnexa_pass', ''];
  const users = ['postgres', 'quizarena_user', 'dreamnexa_user'];
  
  for (const user of users) {
    for (const pw of passwords) {
      const connectionString = `postgresql://${user}:${pw}@localhost:5432/postgres`;
      const client = new Client({ connectionString });
      try {
        await client.connect();
        console.log(`SUCCESS: ${connectionString}`);
        await client.end();
        return;
      } catch (e) {
        // failed
      }
    }
  }
  console.log("No connection combinations succeeded.");
}
testConn();
