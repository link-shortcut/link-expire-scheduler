module.exports.notify = async (text) => {
  const body = {
    text: text,
  };

  try {
    await fetch(process.env.SLACK_NOTI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log(`Slack Notification is Successful. text: ${text}`);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports.notifyIfFailRetry = async (text, tryCount) => {
  if (tryCount < 1) {
    throw new Error(`tryCount must be more than 0`);
  }

  let count = 0;
  while (count < tryCount) {
    try {
      await this.notify(text);
      return;
    } catch (err) {
      count++;
      console.error(`Fail ${count} times for Slack Notification`);
    }
  }
  console.error(`Finally fail Slack Notification with ${count} times of try`);
};
