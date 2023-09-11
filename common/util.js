const { ZonedDateTime, ZoneId, DateTimeFormatter } = require("@js-joda/core");
require("@js-joda/timezone");

module.exports.response = (statusCode, body) => {
  console.log("on response. statusCode: %s, body: %j", statusCode, body);
  return {
    statusCode: statusCode || 200,
    body: JSON.stringify(body || {}, null, 2),
  };
};

module.exports.formatISOLocalDateTime = (dateTime) =>
  dateTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

module.exports.getServerTimeKST = () =>
  ZonedDateTime.now(ZoneId.of("Asia/Seoul"));
