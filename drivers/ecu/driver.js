'use strict';

const Homey = require('homey');
const ECU_connector = require('./ecu_connector');

module.exports = class MyDriver extends Homey.Driver {

  async onInit() {this.log('MyDriver has been initialized');}

    async onPair(session) {
    session.setHandler("keys_entered", async (data) => {
    this.log("ECU credentials received");

    const { ECU_ID, ECU_address } = data;
    this.homey.settings.set("ECU_ID", ECU_ID);
    this.homey.settings.set("ECU_address", ECU_address);

    console.log('Pairing...');
    console.log('IP address:', ECU_address);
    console.log('ECU ID:', ECU_ID);
  });

    session.setHandler("list_devices", async () => {
    const ECU_connection = new ECU_connector();
    console.log("Listing devices...");

    const ECU_ID = this.homey.settings.get("ECU_ID");
    const ECU_address = this.homey.settings.get("ECU_address");
    const ECU_command = 'APS1100160001END';

    try {
      const data = await ECU_connection.fetchData(ECU_address, ECU_command);

      if (data && data.length > 16) {
        console.log("✅ ECU detected");
      } else {
        console.log("❌ Error: No ECU detected");
      }

      const devices = {
        name: 'APsystems ECU',
        data: { ECU_ID },
        store: { ECU_address }
      };

      this.log('Device data:', devices);
      return [devices];

    } catch (err) {
      console.error("Error in retreiving data ", err);
      return [];
    }
  });
}




  onRepair(session, device) {
    // Argument session is a PairSocket, similar to Driver.onPair
    // Argument device is a Homey.Device that's being repaired

    session.setHandler("keys_entered", (data) => {
    this.log("ECU credentials received");

    const { ECU_ID, ECU_address } = data;
    this.homey.settings.set("ECU_ID", ECU_ID);
    this.homey.settings.set("ECU_address", ECU_address);

    console.log('Pairing...');
    console.log('IP address:', ECU_address);
    console.log('ECU ID:', ECU_ID);


    });

    session.setHandler("disconnect", () => {
      // Cleanup
    });
  }

}