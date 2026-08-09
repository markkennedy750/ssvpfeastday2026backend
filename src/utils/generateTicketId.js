const crypto = require('crypto');

const generateTicketId = () => {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `SSVP-${random}`;
};

module.exports = generateTicketId;
