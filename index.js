const DB = require("./common/database.js");
const {
  response,
  formatISOLocalDateTime,
  getServerTimeKST,
} = require("./common/util.js");
const {
  slackNotifyIfFailRetry,
  makeBaseText,
  makeSuccessText,
} = require("./common/slack_notification.js");

module.exports.run = async (event, context) => {
  const slackNotiFailRetryCount = process.env.SLACK_NOTI_FAIL_RETRY_COUNT;

  const time = getServerTimeKST();
  const formattedTime = formatISOLocalDateTime(time);
  console.log(`Link expire function ran at ${formattedTime}`);

  try {
    const expiredLinkIds = await getExpiredLinkIds(formattedTime);
    const deleteLinkHistoryResult = await deleteLinkHistory(expiredLinkIds);
    const deleteLinkResult = await deleteLink(expiredLinkIds);

    const slackText = makeSuccessText({
      time: time,
      success: true,
      deletedLinkCount: deleteLinkResult.affectedRows,
      deletedLinkHistoryCount: deleteLinkHistoryResult.affectedRows,
    });
    await slackNotifyIfFailRetry(slackText, slackNotiFailRetryCount);

    return response(200, {
      message: "만료 링크 삭제 작업에 성공했습니다.",
    });
  } catch (err) {
    console.error(err);

    const slackText = makeBaseText({ time: time, success: false });
    await slackNotifyIfFailRetry(slackText, slackNotiFailRetryCount);

    return response(500, {
      message: "만료 링크 삭제 작업에 실패했습니다.",
    });
  }
};

const getExpiredLinkIds = async (time) => {
  const expiredLinks = await DB.execute({
    psmt: "select link.id from link where link.expired_at < ?",
    binding: [time],
  });

  const expiredLinkIds = expiredLinks.map(({ id }) => id);
  console.log(`Expired Link Id Count : ${expiredLinkIds.length}`);
  return expiredLinkIds;
};

const deleteLinkHistory = async (expiredLinkIds) => {
  if (expiredLinkIds.length < 1) {
    return { affectedRows: 0 };
  }

  const deleteLinkHistoryResult = await DB.execute({
    psmt: "delete from link_history where link_history.link_id in (?)",
    binding: [expiredLinkIds],
  });
  deleteResultLog("Delete LinkHistory", deleteLinkHistoryResult);
  return deleteLinkHistoryResult;
};

const deleteLink = async (expiredLinkIds) => {
  if (expiredLinkIds.length < 1) {
    return { affectedRows: 0 };
  }

  const deleteLinkResult = await DB.execute({
    psmt: "delete from link where link.id in (?)",
    binding: [expiredLinkIds],
  });
  deleteResultLog("Delete Link", deleteLinkResult);
  return deleteLinkResult;
};

const deleteResultLog = (jobName, result) => {
  console.log(`${jobName} DB Server Status : ${result.serverStatus}`);
  console.log(`${jobName} deleted Row Count : ${result.affectedRows}`);
};
