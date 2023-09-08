module.exports.response = (statusCode, body) => {
  console.log("on response. statusCode: %s, body: %j", statusCode, body);
  return {
    statusCode: statusCode || 200,
    body: JSON.stringify(body || {}, null, 2),
  };
};

module.exports.formatDate = (date) =>
  date.toISOString().replace(/T/, " ").replace(/\..+/, "");
