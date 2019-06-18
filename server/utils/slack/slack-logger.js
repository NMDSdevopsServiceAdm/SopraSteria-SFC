// Slack is a great tool for comms. But not just between people. Applications can interact with Slack too.
// Slack application integration allows not just for messaging, but well formatted messaging
const config = require('../../config/config');
const axios = require('axios');

// log to slack; if given level is less than equal to environment Slack log level
const SLACK_TRACE = 5;
const SLACK_INFO = 3;
const SLACK_WARN = 2;
const SLACK_ERROR = 1;
const SLACK_DISABLED = 0;

// posts the given "Slack formatted" message
const postToSlack = async (slackWebHookUrl, slackMsg) => {
    try {
        const apiResponse = await axios.post(
            slackWebHookUrl,
            slackMsg,       // the data
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    } catch (err) {
        // silently discard errors
        console.error("Failed to post to Slack: ", err);
    }
}

// check current Slack log level and only then, post to slack
const logToSlack = async (level, slackMsg) => {
    // default to logging errors only; 0 disables logging
    const ENV_LOG_LEVEL = config.get('slack.level');
    const slackWebHookUrl = config.get('slack.url');

    if (slackWebHookUrl === 'unknown') return;

    if (level <= ENV_LOG_LEVEL) {
        console.log("Posting to slack: ", slackWebHookUrl)
        await postToSlack(slackWebHookUrl, slackMsg);
    }
};

exports.info = async (title, msg) => {
    await logToSlack(SLACK_INFO, {
        text: `INFO`,
        username: 'markdownbot',
        markdwn: true,
        attachments: [
            {
                color: 'good',
                title,
                text: msg
            }
        ]
    });
}

exports.warn = async (title, msg) => {
    await logToSlack(SLACK_WARN, {
        text: `WARNING`,
        username: 'markdownbot',
        markdwn: true,
        attachments: [
            {
                color: 'warning',
                title,
                text: msg
            }
        ]
    });
}

exports.error = async (title, msg) => {
    await logToSlack(SLACK_ERROR, {
        text: `ERROR`,
        username: 'markdownbot',
        markdwn: true,
        attachments: [
            {
                color: 'danger',
                title,
                text: msg
            }
        ]
    });
}

exports.trace = async (title, msg) => {
    await logToSlack(SLACK_TRACE, {
        text: `TRACE`,
        username: 'markdownbot',
        markdwn: true,
        attachments: [
            {
                color: '#777777',
                title,
                text: msg
            }
        ]
    });
}
