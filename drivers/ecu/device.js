'use strict';

const Homey = require('homey');
const ECU_connector = require('./ecu_connector');

let ECU_address = '';
let ECU_ID = '';
let buffer='';
let inverters='';
let peak_power=0;

module.exports = class MyDevice extends Homey.Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    console.log('ECU initializing');

    // Current power
    if (!this.hasCapability("measure_power")) {
    await this.addCapability("measure_power");
    await this.setCapabilityOptions("measure_power", {});
    }
    if (!this.hasCapability("measure_temperature")) {
    await this.addCapability("measure_temperature");
    await this.setCapabilityOptions("measure_temperature", {});
    }
    // Voltage
    if (!this.hasCapability("measure_voltage")) {
    await this.addCapability("measure_voltage");
    await this.setCapabilityOptions("measure_voltage", {});
    }
    // Energy in kWh
    if (!this.hasCapability("meter_power.exported")) {
    await this.addCapability("meter_power.exported");
    await this.setCapabilityOptions("meter_power.exported", {});
    }

    // Number of inverters online
    if (!this.hasCapability("inverters_online")) {
    await this.addCapability("inverters_online");
    await this.setCapabilityOptions("inverters_online", {});
    }

    // Maximum power that day
    if (!this.hasCapability("peak_power")) {
    await this.addCapability("peak_power");
    await this.setCapabilityOptions("peak_power", {});
    }
    ECU_address = this.homey.settings.get('ECU_address');
    ECU_ID = this.homey.settings.get("ECU_ID");
    
    console.log('On init ECU address', ECU_address);
    console.log('On init ECU ID', ECU_ID);

    console.log("Getting number of inverters.");
    inverters = await getNumberOfInverters();

await this.setSettings({
  ECU_ID: ECU_ID,
  ECU_address: ECU_address
})
.catch(error => {
  console.log("❌ Error in setSettings:", error);
});

    console.log('ECU has been initialized');
    console.log('');
    pollLoop.call(this); // Get data and repeat
  };

async getEnergyData(){ 
  console.log('');
  console.log('Getting energy data');
  let totalVoltage = 0;
  let totalTemperature = 0;
  let totalRecords = 0;

    buffer = await getECUdata('APS1100280002', ECU_ID, ECU_address);
    hexdumpall(buffer);
    const payload = buffer.slice(16, 194); // The relevant data
    const blockSize = 21; //Number of bytes per inverter
    console.log('Payload', payload);


    //Get data from the response
    for (let i = 10; i < payload.length; i += blockSize) {
    const record = payload.slice(i, i + blockSize);
    const volt = parseInt(record[16], 10);
    const temp = (record[11] << 8 | record[12])- 100; // Combine two bytes and correct -100
    const online = parseInt(record[6]);

    if(online == 1){ 
    totalVoltage += volt;
    totalTemperature += temp;
    totalRecords++;}
    }

  // Recap
  const averageVoltage = totalVoltage / totalRecords;
  const averageTemp = totalTemperature / totalRecords;

  const strVoltage = averageVoltage.toFixed(0); // Round to whole numbers
  const numVoltage = parseInt(strVoltage); // Make it a number, toFixed returns a string
  console.log('');
  console.log(`Average of voltage: ${averageVoltage.toFixed(0)}V`);
  console.log(`Average of temperature: ${averageTemp.toFixed(1)}°C`);

  //Push data to app
  this.setCapabilityValue("measure_voltage",numVoltage);
  this.setCapabilityValue("measure_temperature",averageTemp);

 }

async getPowerData() {
  console.log('');
  console.log('Getting powerdata'); 
  let buffer;
 
  buffer = await getECUdata('APS1100160001','', ECU_address);
  hexdumpall(buffer);
  const lifeEnergy = ((buffer[27] << 24) | (buffer[28] << 16) | (buffer[29] << 8) | buffer[30]) >>> 0;
  const currentPower = ((buffer[31] << 24) | (buffer[32] << 16) | (buffer[33] << 8) | buffer[34]) >>> 0;
  const todaysEnergy = (((buffer[35] << 24) | (buffer[36] << 16) | (buffer[37] << 8) | buffer[38]) >>> 0)/ 100;
  const invertersOnline = parseInt(buffer[49],10);
  console.log('lifeEnergy', lifeEnergy);
  console.log('currentPower', currentPower);
  console.log('todaysEnergy', todaysEnergy);
  console.log('Inverters online', invertersOnline);
  const time = await getTime.call(this);

  if (currentPower > peak_power){
    peak_power = currentPower;
  }

  await this.setCapabilityValue("meter_power.exported", todaysEnergy);
  await this.setCapabilityValue("measure_power", currentPower);
  await this.setCapabilityValue("inverters_online", invertersOnline);
  await this.setCapabilityValue("peak_power", peak_power);

  if (invertersOnline == 0) {
    this.setCapabilityValue("measure_power",null);
    this.setCapabilityValue("measure_voltage",null);
    this.setCapabilityValue("measure_temperature", null);
   
    if (time === "00:00") {peak_power = 0};
  }
}

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('ECU has been added');
  }

 async onSettings({ oldSettings, newSettings, changedKeys }) {
  this.log('ECU settings were changed');
  console.log('🔧 Old settings:', oldSettings);
  console.log('🆕 New settings:', newSettings);
  console.log('🔑 Changed keys:', changedKeys);

  const messages = [];

  for (const key of changedKeys) {
    const value = newSettings[key];
    console.log('Key', key);
    console.log('Setting', value);

    if (key === 'ECU_ID') {
      const isValidECU_ID = /^\d{12}$/.test(value);
      if (isValidECU_ID) {
        await this.homey.settings.set("ECU_ID", value);
        messages.push('✅ ECU_ID was successfully saved.');
      } else {
        messages.push('❌ ECU_ID must be exactly 12 digits.');
      }
    }

    if (key === 'ECU_address') {
      const isValidIP = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(value);
      if (isValidIP) {
        await this.homey.settings.set("ECU_address", value);
        messages.push('✅ IP address was successfully saved.');
      } else {
        messages.push('❌ Invalid IP address.');
      }
    }
  }

  // Combine all messages into a single return value
  Promise.resolve().then(() => this.onInit()); // To prevent that setSettings is still running when callin onInit
  return messages.join('\n');
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

}

async function getNumberOfInverters() {
  try {
    let attempt = 0;
    let checkOk = false;
    let buffer;

    do {
      buffer = await getECUdata('APS1100160001', '', ECU_address);
      if (!buffer) {
        throw new Error("❗ Failed to retrieve ECU data.");
      }

      hexdumpall(buffer);
      checkOk = checkSum(buffer); // 'false': disable online inverter check
      attempt++;
      await sleep(1000);
    } while (!checkOk && attempt < maxAttempts);

    if (checkOk) {
      if (!buffer || buffer.length < 48) {
        throw new Error("❗ Buffer too short to extract inverter count.");
      }

      const inverterCount = (buffer[46] << 8) | buffer[47];
      if (isNaN(inverterCount)) {
        throw new Error("❗ Failed to parse inverter count from buffer.");
      }

      inverters = inverterCount;
      console.log("✅ Number of inverters:", inverters);
      return inverters;

    } else {
      console.warn(`❗ Data invalid after ${attempt} attempts – procedure cancelled.`);
      return null;
    }

  } catch (err) {
    console.error(`❌ Error in getNumberOfInverters: ${err.message}`);
    return null;
  }
}

async function hexdumpall(buffer) {
  try {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError("❗ Invalid input: expected a Buffer.");
    }

    // 📄 Clean hexdump with ASCII representation
    for (let i = 0; i < buffer.length; i += 21) {
      const block = buffer.slice(i, i + 21);
      const hex = [...block].map(b => b.toString(16).padStart(2, '0')).join(' ');
      const ascii = [...block].map(b => {
        const char = String.fromCharCode(b);
        return b >= 32 && b <= 126 ? char : '.';
      }).join('');
      console.log(i.toString().padStart(4, '0') + '  ' + hex.padEnd(47) + '  ' + ascii);
    }

  } catch (err) {
    console.error(`❌ Error in hexdumpall: ${err.message}`);
  }
}

async function  getECUdata(command, ECU_ID, ECU_address) {
  try {
    const ECU_command = command + ECU_ID + 'END';
    const ECU_connection = new ECU_connector();
    const ecudata = await ECU_connection.fetchData(ECU_address, ECU_command);
    console.log('getECUdata result:', ecudata);
    if (!ecudata || !ecudata.data) {
      throw new Error("No valid ECU-data received.");
    }

    const buffer = Buffer.from(ecudata.data);
    return buffer;
  } catch (error) {
    console.error("❗ Error in retreiving ECU-data:");

    // Optioneel: log ook de code en stacktrace
    if (error.code) console.error("🔹 Errorcode:", error.code);
    console.error("🔹 Stacktrace:", error.stack);

    return null;
  }
}

function checkSum(buffer) {
  try {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError("❗ Invalid buffer object: expected a Buffer.");
    }

    if (buffer.length < 9) {
      throw new RangeError("❗ Buffer is too short to contain length information.");
    }

    // Length of bytes (5 - 8) as ASCII
    const lengthAscii = buffer.slice(5, 9).toString('ascii');
    const expectedLength = parseInt(lengthAscii, 10);

    if (isNaN(expectedLength)) {
      throw new Error(`❗ Invalid length value in buffer: "${lengthAscii}" is not a number.`);
    }

    // Length of dump without last byte (linefeed, 0x0A)
    const lastByte = buffer[buffer.length - 1];
    const actualLength = lastByte === 0x0A ? buffer.length - 1 : buffer.length;

    if (expectedLength !== actualLength) {
      console.warn(`⛔ Length mismatch (expected: ${expectedLength}, actual: ${actualLength})`);
      return false;
    }

    // All OK
    return true;

  } catch (err) {
    console.error(`❌ Error in checkSum: ${err.message}`);

    return false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    setTimeout(() => pollLoop.call(this), 1 * 60 * 1000);
  }
}

async function getTime() {
 
    const tz = await this.homey.clock.getTimezone();
    console.log(`The timezone is ${tz}`);

    // Define a function to get the time in a specific timezone
    const formatter = new Intl.DateTimeFormat([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Use 24-hour format
      timeZone: tz,
    });
    const timeParts = formatter.formatToParts(new Date());
    const hour = timeParts.find(part => part.type === 'hour').value;
    const minute = timeParts.find(part => part.type === 'minute').value;

    console.log(`The time is ${hour}:${minute}`);
    return `${hour}:${minute}`;
  }
