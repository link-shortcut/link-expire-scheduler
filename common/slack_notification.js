const { getServerTimeKST } = require("./util.js");
const { DateTimeFormatter, Duration } = require("@js-joda/core");

module.exports.slackNotifyThrow = async (text) => {
  const body = {
    text: text,
  };

  try {
    const response = await fetch(process.env.SLACK_NOTI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Sending Slack Notification is Failed");
    }
    console.log(`Slack Notification is Successful. text: ${text}`);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports.slackNotifyIfFailRetry = async (text, tryCount) => {
  if (tryCount < 1) {
    throw new Error(`tryCount must be more than 0`);
  }

  let count = 0;
  while (count < tryCount) {
    try {
      await this.slackNotifyThrow(text);
      return;
    } catch (err) {
      count++;
      console.error(`Fail ${count} times for Slack Notification`);
    }
  }
  console.error(`Finally fail Slack Notification with ${count} times of try`);
};

module.exports.makeSuccessText = ({
  time,
  success,
  deletedLinkCount,
  deletedLinkHistoryCount,
}) =>
  `${this.makeBaseText({ time, success })}
삭제된 만료 Link 수 : ${deletedLinkCount}
삭제된 LinkHistory 수 : ${deletedLinkHistoryCount}`;

module.exports.makeBaseText = ({ time, success }) =>
  `작업 성공 여부 : ${success === true ? "성공" : "실패"}
작업 시작 시간 : ${time.format(
    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
  )}
작업 소요 시간 : ${durationTimeString(time, getServerTimeKST())}`;

const durationMilliTime = (start, end) =>
  Duration.between(start, end).toMillis();

const durationTimeString = (start, end) => {
  const units = [
    { name: "s", value: 1000 },
    { name: "m", value: 60 },
  ];

  const duration = durationMilliTime(start, end);

  let convertedDuration = duration;
  let convertedUnit = "ms";
  for (const unit of units) {
    if (convertedDuration < unit.value) {
      break;
    }
    convertedDuration = (convertedDuration / unit.value).toFixed(2);
    convertedUnit = unit.name;
  }
  return `${convertedDuration}${convertedUnit}`;
};
