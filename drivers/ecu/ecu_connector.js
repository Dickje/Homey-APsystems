const net = require('net');

class ECU_connector {

async fetchData(ECU_address, ECU_command) {
  ECU_address = stripLeadingZeros(ECU_address);
  console.log('Command', ECU_command, 'to IP address', ECU_address);

  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    const TIMEOUT_MS = 5000;

    client.setTimeout(TIMEOUT_MS);

    client.on('error', (err) => {
      console.error('❗ Connection error:', err.message);
      reject(err);
    });

    client.on('timeout', () => {
      console.error(`⏱️ Timeout: no reply within ${TIMEOUT_MS / 1000} seconds.`);
      client.destroy(); // sluit de socket
      reject(new Error('Timeout in connection to ECU'));
    });

    client.connect(8899, ECU_address, () => {
      client.write(ECU_command, 'utf-8');
    });

    client.on('data', (data) => {
      resolve({data});
      client.destroy();
    });
  });
}
}

module.exports = ECU_connector;

function stripLeadingZeros(ip) {
      return ip
    .split('.')
    .map(octet => String(Number(octet)))
    .join('.');
}