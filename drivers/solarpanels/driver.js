'use strict';

const Homey = require('homey');
const MyApi = require('./api');
const sid = Homey.env.CLIENT_SID;
  var apiKey;
  var apiSecret;

module.exports = class MyDriver extends Homey.Driver {



  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('MyDriver has been initialized');
  }

  /**
   * onPairListDevices is called when a user is adding a device
   * and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */

   async onPairListDevices() {
    this.log('Pairing...')
    const pairApi = new MyApi;
    const credentials = Homey.getSetting("apiCredentials");
    apiKey = credentials.apiKey;
    apiSecret = credentials.apiSecret;
 
    console.log()
    const returndata = await pairApi.fetchData('/user/api/v2/systems/details/' + sid,'', 'GET')
    this.log(returndata);
    const device = [
           { 
        name: 'APsystems',
        data : {sid_id: returndata.data.sid},
        store: {
                installdate: returndata.data.create_date,
                capacity: returndata.data.capacity,
                ecu_id : returndata.data.ecu[0],
                api_Key: apiKey,
                api_Secret: apiSecret
        },
      } 
    ];
this.log(device);
return device;
  }
 
};
