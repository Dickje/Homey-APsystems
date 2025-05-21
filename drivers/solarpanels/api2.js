'use strict';

const Homey = require('homey');
const crypto = require("crypto");
const axios = require("axios"); // Axios voor HTTP-verzoeken

module.exports = class MyApi extends Homey.Api {
    constructor(request_path, request_param, http_method) {
       super();

    //fetchData(request_path, request_param, http_method) {

    //async fetchData() {
      
    const api_key = Homey.env.CLIENT_ID;
    const api_secret = Homey.env.CLIENT_SECRET;
    const { v4: uuidv4 } = require("uuid");
    const nonce = uuidv4().replace(/-/g, "");
    const timestamp = Date.now().toString();
    const signature_method = 'HmacSHA256';

    // Request data
    this.base_url = "https://api.apsystemsema.com:9282";

    // Create string to sign
    var urlSegments = request_path.split("/");
    var lastSegment = urlSegments[urlSegments.length - 2  ];
    
    //console.log("lastsegment:", lastSegment);
    const stringToSign = `${timestamp}/${nonce}/${api_key}/${lastSegment}/${http_method}/${signature_method}`;

    // Calculate signature
    const hmacSha256 = crypto.createHmac("sha256", api_secret);
    hmacSha256.update(stringToSign);
    const signature = hmacSha256.digest("base64");

    // Create headers
    this.headers = {
        "X-CA-AppId": api_key,
        "X-CA-Timestamp": timestamp,
        "X-CA-Nonce": nonce,
        "X-CA-Signature-Method": signature_method,
        "X-CA-Signature": signature,
    };

// Create the full URL
   this.url = this.base_url + request_path;
   console.log("Full url: ", this.url);
   console.log("Last segment:", lastSegment);
    
    }
 fetchData() {

    try {
        const response = axios.get(this.url, {
            headers: this.headers
        });
        
        console.log("API Response:", response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            // Server heeft geantwoord met een statuscode buiten 2xx
            console.error("Serverfout:", error.response.status);
            console.error("Responsdata:", error.response.data);
        } else if (error.request) {
            // Verzoek is gemaakt, maar geen antwoord ontvangen
            console.error("Geen antwoord van server ontvangen.");
        } else {
            // Andere fouten (zoals configuratie of netwerkproblemen)
            console.error("Fout bij aanvraag:", error.message);
        }
        return null; // Retourneer null bij fouten
    }
   }
 
};
