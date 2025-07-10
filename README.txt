Read power and energy from APsystems Solar Panels

I'm grateful for the work of the Home Automation community, who published a lot of info.
See https://github.com/HAEdwin/homeassistant-apsystems_ecu_reader for details.

Configure your wireless ECU connection
Install EMA Manager: Download and install the EMA Manager app on your mobile device from the appropriate app store.
Put ECU-R in Access Point Mode: Locate the physical button on your ECU-R router. 
Press and hold the button for a few seconds until the router's Wi-Fi starts. 
You should see it in your accessible WIFI networks of your device (phone). This indicates that the router is in Access Point mode.
Connect to ECU-R Wi-Fi: Use your mobile device to connect to the newly created Wi-Fi network from your ECU-R router. 
The default Wi-Fi password is 88888888.
Launch EMA Manager: Open the EMA Manager app on your device. Choose the "Local" connection option. 
The app should automatically detect and connect to your ECU-R router.
Configure ECU-R Network Settings: Once connected, use the EMA Manager app to configure the ECU-R's network settings. 
Connect the ECU-R to the same (Wi-Fi) network as your Homey.
Test the ECU connection and finding your ECU on the Local Network

Testing the connection can be done by using ping or from the terminal using the Netcat command, follow the example below but use the correct (fixed) IP address of your ECU. 
If connected you'll see line 2, then type in the command APS1100160001END if you get a response (line 4) you are ready to install the integration. 
If not, power cycle your ECU wait for it to get started and try again. It is highly recommended to assign a fixed IP-Address to the ECU.

[core-ssh .storage]$ nc -v 172.16.0.4 8899 <┘
172.16.0.4 (172.16.0.4:8899) open
APS1100160001END <┘
APS11009400012160000xxxxxxxz%10012ECU_R_1.2.22009Etc/GMT-8
