'use strict';

const { v4: uuidv4 } = require("uuid");
const Homey = require('homey');
const api_key = Homey.env.CLIENT_ID;
const api_secret = Homey.env.CLIENT_SECRET;
const sid = Homey.env.CLIENT_SID;
const eid = Homey.env.CLIENT_EID;
const uid = '' ; // Unieke inverter id
const signature_method = "HmacSHA256";
const nonce = uuidv4().replace(/-/g, "");
const ts = Date.now();
const timestamp = ts.toString();
const base_url = "https://api.apsystemsema.com:9282";
const http_method = "GET";

module.exports = class MyApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('MyApp has been initialized');
    //const card = this.homey.flow.getConditionCard(energylevel);
    //card.registerRunListener;
  }

};
