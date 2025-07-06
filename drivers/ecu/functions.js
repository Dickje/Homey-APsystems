function stripLeadingZeros(ip) {
      return ip
    .split('.')
    .map(octet => String(Number(octet)))
    .join('.');
}


module.exports = {
  stripLeadingZeros,
  APSstr  ,
  APSint
};

