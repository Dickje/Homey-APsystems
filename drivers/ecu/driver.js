'use strict';

const Homey = require('homey');
const ECU_connector = require('./ecu_connector');

module.exports = class MyDriver extends Homey.Driver {

  async onInit() {this.log('MyDriver has been initialized');}

  async onPair(session) {
    let devices='';

      session.setHandler("keys_entered", async (data) =>
      {
      this.log("ECU credentials received");

     // Get the entered keys
      const { ECU_ID, ECU_address } = data;
      this.homey.settings.set("ECU_ID", ECU_ID);
      this.homey.settings.set("ECU_address", ECU_address);
      this.log('Pairing...')
      })

      session.setHandler("list_devices", async () => 
      {
      const ECU_connection = new ECU_connector;
      this.homey.log("Listing devices");
      const ECU_ID = this.homey.settings.get("ECU_ID");
      const ECU_address =  this.homey.settings.get("ECU_address");
      const ECU_command = 'APS1100160001END';

    const data = ECU_connection.fetchData(ECU_address, ECU_command)  
    if (data.length > 16) {
        console.log("ECU detected")
    } else {
        console.log["Error"] = "No inverters active";
        }
    devices = 
        {
        name: 'APsystems ECU',
        data:  {ECU_ID},
        store: {ECU_address : ECU_address} 
        }
    this.log('Device data ', devices);
    return [devices]
      })
    }}