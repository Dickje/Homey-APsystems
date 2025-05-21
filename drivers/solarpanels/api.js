const Homey = require('homey');

module.exports = class MyApi extends Homey.Api {
    
    async fetchData(request_path, request_param, http_method) {
   
        const crypto = require("crypto");
        const axios = require("axios"); // Axios voor HTTP-verzoeken
        const api_key = Homey.env.CLIENT_ID;
        const api_secret = Homey.env.CLIENT_SECRET;
        const { v4: uuidv4 } = require("uuid");
        const nonce = uuidv4().replace(/-/g, "");
        const timestamp = Date.now().toString();
        const signature_method = 'HmacSHA256';

        const base_url = "https://api.apsystemsema.com:9282";
        
        const urlSegments = request_path.split("/");
        const lastSegment = urlSegments[urlSegments.length - 1];
        const stringToSign = `${timestamp}/${nonce}/${api_key}/${lastSegment}/${http_method}/${signature_method}`;

        const hmacSha256 = crypto.createHmac("sha256", api_secret);
        hmacSha256.update(stringToSign);
        const signature = hmacSha256.digest("base64");

        const headers = {
            "X-CA-AppId": api_key,
            "X-CA-Timestamp": timestamp,
            "X-CA-Nonce": nonce,
            "X-CA-Signature-Method": signature_method,
            "X-CA-Signature": signature,
        };

        const url = base_url + request_path + request_param;
        console.log('Complete URL:', url);
        console.log('Laatste segment:', lastSegment);

        try {
            const response = await axios.get(url, { headers });
            console.log("API Response:", response.data);
            return response.data;
        } catch (error) {
            console.error("Fout bij API-aanvraag:", error.message);
            return null;
        }
    }
}