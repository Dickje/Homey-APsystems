'use strict';

const Homey = require('homey');
const MyApi = require('./api');

module.exports = class MyDevice extends Homey.Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    console.log('Initializing MyDevice');
      var sid='';
      var eid='';
      var apiKey='';
      var apiSecret='';

      sid = this.homey.settings.get("sid");
      eid = this.homey.settings.get("eid");
      apiKey =  this.homey.settings.get("apiKey");
      apiSecret = this.homey.settings.get("apiSecret");


    const settings = this.getSettings();
    const waitTime = settings.pollinginterval;

  
    if (!this.hasCapability("meter_power")) {
    await this.addCapability("meter_power");
    await this.setCapabilityOptions("meter_power", {});
  }

    if (!this.hasCapability("measure_power")) {
    await this.addCapability("measure_power");
    await this.setCapabilityOptions("measure_power", {});
    }

    console.log('MyDevice has been initialized');
    await this.getTodaysEnergy();
    await this.getCurrentEnergy();
    await new Promise((r) => setTimeout(r, waitTime*60*1000));
  //}
}


  async getTodaysEnergy() {
   const dateToday = this.epochToDate(Date.now().toString());
   console.log(dateToday);

      var sid='';
      var eid='';
      var apiKey='';
      var apiSecret='';

      sid = this.homey.settings.get("sid");
      eid = this.homey.settings.get("eid");
      apiKey =  this.homey.settings.get("apiKey");
      apiSecret = this.homey.settings.get("apiSecret");

     const DeviceApi = new MyApi;
     const ApiResult = await DeviceApi.fetchData('/user/api/v2/systems/summary/' + sid , '', 'GET', apiKey, apiSecret);
      
     console.log(ApiResult.data.today);
     const total_energy=ApiResult.data.today*1;
 
    await this.setCapabilityValue("meter_power",total_energy);
     }

  async getCurrentEnergy() {
  //  const dateToday = this.epochToDate(Date.now().toString());
  //  console.log(dateToday);
  //     var sid='';
  //     var eid='';
  //     var apiKey='';
  //     var apiSecret='';

  //     sid = this.homey.settings.get("sid");
  //     eid = this.homey.settings.get("eid");
  //     apiKey =  this.homey.settings.get("apiKey");
  //     apiSecret = this.homey.settings.get("apiSecret");

  //fetchData(request_path, request_param, http_method, api_Key, api_Secret)

     //const DeviceApi = new MyApi;
      // this.registerCapabilityListener("meter_power", async (value) => {
      //     const ApiResult = await DeviceApi.fetchData('/user/api/v2/systems/' + sid + 
      //   '/devices/inverter/batch/energy/' + eid , '?energy_level=power&date_range=' + dateToday, 'GET', apiKey, apiSecret);
        //const ApiResult = await DeviceApi.fetchData('/user/api/v2/systems/summary/' + sid , '', 'GET', apiKey, apiSecret);
    
    //console.log(ApiResult.data.energy);
    //console.log(ApiResult.data.today);
    // const FormattedApiResult = ApiResult.data.energy.map(item => item.replace(/'/g,'"'));
    // const current_energy = FormattedApiResult

    // .map(item => item.split('-')[2]) // Haal het derde element op
    // .map(Number) // Zet om naar een getal
    // .reduce((acc, num) => acc + num, 0); // Tel alles op

    //await this.setCapabilityValue("measure_power",current_energy);
    //console.log(current_energy);
  }
    // Wait the set time to prevent too much API calls
    //await new Promise((r) => setTimeout(r, waitTime*60*1000));

epochToDate(epoch) {
    let date = new Date(epoch*1); //* 1 for typeconversion string to number
    console.log(date);
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0, so add 1
    let day = String(date.getDate()).padStart(2, '0'); // The last bit makes sure that the result is two digits
    return `${year}-${month}-${day}`;
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
  

}
