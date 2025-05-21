const urls = {
  // Get Details for a Particular System
  url_1 : '/user/api/v2/systems/details/' + sid,

  // Get Inverters for a Particular System
  url_2 : '/user/api/v2/systems/inverters/' + sid,

  // Get Meters for a Particular System
  url_3 : '/user/api/v2/systems/meters/' + sid,

  //Get Summary Energy for a Particular System
  url_4 : '/user/api/v2/systems/summary/' + sid,

  //Get Energy in Period for a Particular System
  url_5 : '/user/api/v2/systems/energy/' + sid, 

  // Get Summary Energy for a Particular ECU
  url_6 : '/user/api/v2/systems/' + sid + '/devices/ecu/summary/' + eid,

  // Get Energy in Period for a Particular ECU
  url_7 : '/user/api/v2/systems/' + sid + '/devices/ecu/energy/' + eid,

  // Get Summary Energy for a Particular Meter
  url_8 : '/user/api/v2/systems/' + sid + '/devices/meter/summary/' + eid,

  // Get Energy in Period for a Particular Meter
  url_9 : '/user/api/v2/systems/' + sid + '/devices/meter/period/' + eid,

  // Get Energy in Period for a Particular Inverter
  url_10 : '/user/api/v2/systems/'+ sid  + '/devices/inverter/summary/' + uid, 

  // Get Energy in Period for a Particular Inverter
  url_11 : '/user/api/v2/systems/'+ sid  + '/devices/inverter/energy/' + eid,

  // Get Energy in a Day for all inverters below a Particular ECU
  url_12 : '/user/api/v2/systems/'+ sid  + '/devices/inverter/batch/energy/' + eid

}