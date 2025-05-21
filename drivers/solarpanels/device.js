'use strict';

const Homey = require('homey');
const MyApi = require('./api');
const MyDriver = require('./driver');
const sid = Homey.env.CLIENT_SID;
const eid = Homey.env.CLIENT_EID;

module.exports = class MyDevice extends Homey.Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyDevice has been initialized');

    const settings = this.getSettings();
    console.log(settings.pollinginterval);

  
    if (!this.hasCapability("meter_power")) {
    await this.addCapability("meter_power");
    await this.setCapabilityOptions("meter_power", {});
  }
 
      const DeviceApi = new MyApi;
      this.registerCapabilityListener("meter_power", async (value) => {
      ApiResult = await DeviceApi.fetchData('/user/api/v2/systems/' + sid + '/devices/inverter/batch/energy/' + eid , '?energy_level=energy&date_range=2025-05-17', 'GET')
    });

    const ApiResult = await DeviceApi.fetchData('/user/api/v2/systems/' + sid + '/devices/inverter/batch/energy/' + eid , '?energy_level=energy&date_range=2025-05-17', 'GET')
    
    console.log(ApiResult.data.energy);
    const FormattedApiResult = ApiResult.data.energy.map(item => item.replace(/'/g,'"'));
    const total_energy = FormattedApiResult
    .map(item => item.split('-')[2]) // Haal het derde element op
    .map(Number) // Zet om naar een getal
    .reduce((acc, num) => acc + num, 0); // Tel alles op

    await this.setCapabilityValue("meter_power",total_energy);
    console.log(total_energy);
    console.log('Store keys',this.getStoreKeys(MyDevice));
    console.log(this.getStore(MyDevice));

  }


  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyDevice has been added');
    //this.log('Mydevice', returndata);
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
    this.log('MyDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('MyDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyDevice has been deleted');
  }

};
