const path = require('path');
const fs = require('fs');

const logger = (req, res, next) => {
    const url = req.url;
    const date = new Date();
    const msg = `Date: ${date}, Url:${url} \n`;
    fs.appendFile(path.join(__dirname,"..", 'log.txt'), msg, () => {
      console.log('success!!');
      next();
    });
  
  }
  module.exports = logger