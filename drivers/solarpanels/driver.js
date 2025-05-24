'use strict';

const Homey = require('homey');
const MyApi = require('./api');

module.exports = class MyDriver extends Homey.Driver {

  async onInit() {this.log('MyDriver has been initialized');}

  async onPair(session) {
    let devices='';
    
      session.setHandler("keys_entered", async (data) =>
      {
      this.log("Api credentials received");

      // Get the entered keys
      const { apiKey, apiSecret, sid } = data;
      this.homey.settings.set("apiKey", apiKey);
      this.homey.settings.set("apiSecret", apiSecret);
      this.homey.settings.set("sid", sid);

      console.log('Pairing...')
      })

      session.setHandler("list_devices", async () => 
      {
      this.homey.log("Listing devices");
      var sid='';
      var apiKey='';
      var apiSecret='';

      sid = this.homey.settings.get("sid");
      apiKey =  this.homey.settings.get("apiKey");
      apiSecret = this.homey.settings.get("apiSecret");
      //console.log(sid,' ', apiKey,' ', apiSecret);

      const pairApi = new MyApi;
      const returndata = await pairApi.fetchData('/user/api/v2/systems/details/' + sid,''
                                        , 'GET', apiKey, apiSecret);
      devices = 
        {
                name: 'APsystems',
        data : {sid},
        store: {installdate:  returndata.data.create_date,
                capacity:     returndata.data.capacity,
                ecu_id :      returndata.data.ecu[0]} 
        }
      
        this.homey.settings.set("eid", String(devices.store.ecu_id));
        console.log(devices);
        return [devices]
      }
     )        
    }
  }
