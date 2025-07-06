'use strict';

const Homey = require('homey');
const ECU_connector = require('./ecu_connector');
let ECU_address = '';
let ECU_ID = '';
let buffer='';

module.exports = class MyDevice extends Homey.Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    console.log('ECU has been initializing');

    if (!this.hasCapability("measure_temperature")) {
    await this.addCapability("measure_temperature");
    await this.setCapabilityOptions("measure_temperature", {});
    }
    if (!this.hasCapability("measure_power")) {
    await this.addCapability("measure_power");
    await this.setCapabilityOptions("measure_power", {});
    }
    if (!this.hasCapability("measure_voltage")) {
    await this.addCapability("measure_voltage");
    await this.setCapabilityOptions("measure_voltage", {});
    }
    if (!this.hasCapability("meter_power.exported")) {
    await this.addCapability("meter_power.exported");
    await this.setCapabilityOptions("meter_power.exported", {});
    }


    ECU_address = this.homey.settings.get('ECU_address');
    ECU_ID = this.homey.settings.get("ECU_ID");

    console.log('ECU has been initialized');
    pollLoop.call(this); // Get data and repeat
  };

async getEnergyData(){ 
  console.log('Getting energy data');
  let totaalFreq = 0;
  let totalPower = 0;
  let totalVoltage = 0;
  let totalTemperature = 0;
  let totalRecords = 0;
  let checkOk = false;
  let maxAttempts = 5;
  let attempt = 0;

do {
    buffer = await getECUdata('APS1100280002', ECU_ID, ECU_address);
    //Show data in dump
    //hexdumpall(buffer); 
    checkOk = checkSum(buffer, true); //'true': Enable check if inverters are online
    attempt++;
    await sleep(1000);
  } while (!checkOk && attempt < maxAttempts);

    if (!checkOk) {
    console.warn(`❗ Data after ${attempt} attempts are not valid - procedure cancelled`);
    hexdumpall(buffer);
    return; // Skip rest of procedure
  }

    const payload = buffer.slice(16, 194); // The relevant data
    const blockSize = 21; //Number of bytes per inverter

    //Get data from the response
    for (let i = 10; i < payload.length; i += blockSize) {
    const record = payload.slice(i, i + blockSize);
    const pwr1 = parseInt((record[15] << 8 | record[14]),10);  //Combine two bytes for power of channel 1 from inverter
    const pwr2 = parseInt((record[19] << 8 | record[18]),10);  //Combine two bytes for power of channel 2 from inverter
    const volt = parseInt(record[16], 10);
    const temp = (record[11] << 8 | record[12])- 100; // Combine two bytes and correct -100

    totalPower += pwr1 + pwr2;
    totalVoltage += volt;
    totalTemperature += temp;
    totalRecords++;
    }

  // Recap
  const averageVoltage = totalVoltage / totalRecords;
  const averageTemp = totalTemperature / totalRecords;

  console.log(`Total power: ${totalPower}W`);
  console.log(`Average of voltage: ${averageVoltage.toFixed(0)}V`);
  console.log(`Average of temperature: ${averageTemp.toFixed(1)}°C`);

  //Push data to app
  this.setCapabilityValue("measure_power",totalPower);
  this.setCapabilityValue("measure_voltage",averageVoltage);
  this.setCapabilityValue("measure_temperature",averageTemp);
 }

async getPowerData() {
  console.log('Getting powerdata'); 
  let checkOk = false;
  let buffer;
  let maxAttempts = 5;
  let attempt = 0;

  do {  
    buffer = await getECUdata('APS1100160001','', ECU_address);
    //hexdumpall(buffer); 
    checkOk = checkSum(buffer, false);//'false': disable check if inverters are online
    attempt++;
    await sleep(1000);
  } while (!checkOk && attempt < maxAttempts);

  if (!checkOk) {
    console.warn(`❗ Data after ${attempt} attempts are not valid - procedure cancelled`);
    hexdumpall(buffer);
    return; //Skip rest of procedure
  }

  const lifeEnergy = ((buffer[27] << 24) | (buffer[28] << 16) | (buffer[29] << 8) | buffer[30]) >>> 0;
  const currentPower = ((buffer[31] << 24) | (buffer[32] << 16) | (buffer[33] << 8) | buffer[34]) >>> 0;
  const todaysEnergy = (((buffer[35] << 24) | (buffer[36] << 16) | (buffer[37] << 8) | buffer[38]) >>> 0)/ 100;
  const invertersOnline = parseInt(buffer[49],10);
  console.log('Inverters online', invertersOnline);

  await this.setCapabilityValue("meter_power.exported", todaysEnergy);
  await this.setCapabilityValue("measure_power", currentPower);
  if (invertersOnline == 0) {
    this.setCapabilityValue("measure_power",0);
    this.setCapabilityValue("measure_voltage",0);
    this.setCapabilityValue("measure_temperature", 0);
  }

  console.log('Lifetime energy', lifeEnergy);
  console.log('Current power', currentPower);
  console.log('Todays energy', todaysEnergy);
}


  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('ECU has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('ECU settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('ECU was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('ECU has been deleted');
  }
};

async function hexdumpall(buffer){
//const buffer = await bufferPromise;
 //const sliced = buffer.slice(0, buffer.length);
 const sliced = buffer;
// 📄 Nette hexdump met ASCII:
for (let i = 0; i < sliced.length; i += 21) {
  const blok = sliced.slice(i, i + 21); 
  const hex = [...blok].map(b => b.toString(16).padStart(2, '0')).join(' ');
  const ascii = [...blok].map(b => {
    const char = String.fromCharCode(b);
    return b >= 32 && b <= 126 ? char : '.';
  }).join('');
  console.log((i).toString().padStart(4, '0') + '  ' + hex.padEnd(47) + '  ' + ascii);
}
}

async function getECUdata(command, ECU_ID, ECU_address) {
    const ECU_command= command + ECU_ID + 'END';
    const ECU_connection = new ECU_connector;
    const ecudata = await (ECU_connection.fetchData(ECU_address, ECU_command));
    const buffer = Buffer.from(ecudata.data); //Transform the data into a 'buffer'
return buffer
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkSum(buffer, onlineCheck) {
    if (!Buffer.isBuffer(buffer)) {
    console.error("❗ Ongeldig bufferobject");
    return false;
  }

// Length of bytes (5 - 8) as ASCII 
const lengthAscii = buffer.slice(5, 9).toString('ascii'); //Length as ascii
const expectedLength = parseInt(lengthAscii, 10); //Length as decimal number

// Length of dump without last byte (linefeed, 0x0A)
  const lastByte = buffer[buffer.length - 1];
  const actualLength = lastByte === 0x0A ? buffer.length - 1 : buffer.length;
  if (expectedLength !== actualLength) {
  console.warn(`⛔ Length is not ok (expected: ${expectedLength}, actual: ${actualLength})`);
  return false;
  }

  if (onlineCheck){
  //Check if all inverters were online
  const base = 32; //startbyte
  const inverters = 8; // 8 inverters
  const indices = Array.from({ length: inverters }, (_, i) => base + i * 21);
  const allValues1 = indices.every(i => buffer[i] === 1);

  if (!allValues1) {
    indices.forEach(i => {
      if (buffer[i] !== 1) {
        console.warn(`⛔ Byte on position ${i} = ${buffer[i]} (Expected 1)`);
      }
    });
    return false;
  }
}

  // All  OK
  return true;
}

async function pollLoop() {
  try {
    await Promise.all([
      await this.getEnergyData(),
      await this.getPowerData()
    ]);
  } catch (err) {
    console.warn("Polling error:", err);
  } finally {
    setTimeout(() => pollLoop.call(this), 5 * 60 * 1000);
  }
}