'use strict';

const Homey = require('homey');
const MyApi = require('./api');
const sid = Homey.env.CLIENT_SID;

module.exports = class MyDriver extends Homey.Driver {

  async onInit() {
    this.log('MyDriver has been initialized');
  }
  async onPair(session) {
    session.setHandler("keys_entered", async (data) => {
      this.homey.log("Pair data received");

      const { apiKey, apiSecret } = data;
      this.homey.settings.set("apiKey", apiKey);
      this.homey.settings.set("apiSecret", apiSecret);
      console.log("onpair");
      console.log(apiKey);
      console.log(apiSecret);
    this.log('Pairing...')
    const pairApi = new MyApi;
    
    const returndata = await pairApi.fetchData('/user/api/v2/systems/details/' + sid,'', 'GET')
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
    });


  }

  /*
  async onPairListDevices() {
    this.log('Pairing...')
    const pairApi = new MyApi;
    
    const returndata = await pairApi.fetchData('/user/api/v2/systems/details/' + sid,'', 'GET')
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
*/
};
