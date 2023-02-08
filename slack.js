const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const { shuffle, formatData, sleep } = require("./utils");
const { initializeDatabase } = require("./google/google");

const messageInterval = parseInt(process.env.INTERVAL_TIME_MINUTES) || 15;
const replyTimeWait = parseInt(process.env.REPLY_TIME_MINUTES) || 1;
const channelId = process.env.SLACK_CHANNEL_ID;
const authToken = process.env.SLACK_API_TOKEN;

const usersToTag = ["U03N94ASKAA", "U03MRFVS22Z", "U029XJBGSSX", "U028BA0HMRA"];

const sendSlackMessage = async (messageText, threadId = null) => {
  try {
    const data = threadId
      ? {
          channel: channelId,
          text: messageText,
          thread_ts: threadId,
        }
      : {
          channel: channelId,
          text: messageText,
        };

    const response = await axios.post(
      `https://slack.com/api/chat.postMessage`,
      data,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          ContentType: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const buildFirstMessage = (word) => {
  let tagString = "";
  for (let i = 0; i < usersToTag.length; i++) {
    const user = usersToTag[i];
    tagString += `<@${user}>`;
  }

  const messageText = `
_Flash Card Round_

*${word}*

What is the meaning of the word?
Answer will be posted in a minute :think:

${tagString}`;

  return messageText;
};

const buildReplyMessage = (word, meanings, sentences) => {
  let meaningsText = ``;
  for (let i = 0; i < meanings.length; i++) {
    const meaning = meanings[i];
    meaningsText += `- ${meaning}`;
  }

  const messageText = `
The meanings of the word *${word}* are:

${meaningsText}

An example sentence: 
\`${sentences[0]}\`
`;

  return messageText;
};

const runSlackBot = async (dataStore) => {
  const uniqueWords = dataStore.length;
  if (uniqueWords <= 0) return console.log("Error! No Data found!");

  console.log("Starting Bot ...");
  const randomDataStore = shuffle(dataStore);

  for await (dataStore of randomDataStore) {
    const { word, meanings, sentences } = dataStore;

    console.log("Sending First Message");
    const messageText = buildFirstMessage(word);
    const response = await sendSlackMessage(messageText);
    const threadId = response.ts;

    setTimeout(async () => {
      console.log("Sending Reply Message");
      const messageText = buildReplyMessage(word, meanings, sentences);
      await sendSlackMessage(messageText, threadId);
    }, replyTimeWait * 1000 * 60);

    await sleep(messageInterval * 1000 * 60);
  }
};

const main = async () => {
  try {
    const rows = await initializeDatabase();
    const dataStore = formatData(rows);

    fs.writeFile(
      "cache.json",
      JSON.stringify(dataStore),
      "utf-8",
      (err, data) => {
        if (err) return console.error(err);
        console.log(`Stored in Cache Successfully!`);
      }
    );

    await runSlackBot(dataStore);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
