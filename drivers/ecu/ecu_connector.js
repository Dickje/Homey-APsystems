const net = require('net');

class ECU_connector {

  async fetchData(ECU_address, ECU_command) { 
    ECU_address = stripLeadingZeros(ECU_address);
    console.log('Commando', ECU_command , 'to IP adress',ECU_address);
    
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      client.on('error', (err) => {
        console.error('Verbindingsfout:', err.message);
        reject(err);
      });  
      client.connect(8899, ECU_address, () => {
        client.write(ECU_command, 'utf-8');
      });
      client.on('data', (data) => {
        resolve({
    data
        });
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