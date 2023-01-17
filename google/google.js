const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

const TOKEN_PATH = path.join(__dirname, "token.json");
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");

exports.initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(CREDENTIALS_PATH, (err, content) => {
      if (err) reject(`Error loading client secret file: ${err}`);

      authorize(JSON.parse(content), async (auth) => {
        try {
          const words = await getWordsList(auth);
          resolve(words);
        } catch (error) {
          reject(error);
        }
      });
    });
  });
};

const getWordsList = (auth) => {
  return new Promise((resolve, reject) => {
    const sheets = google.sheets({ version: "v4", auth });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: "1E5Odl7OOxeVDwHRU4-G9v1sIJiKlatGaDdkav-R1hKw",
        range: "2:100",
      },
      (err, res) => {
        if (err) {
          reject(`The API returned an error: ${err}`);
        }

        const rows = res.data.values;

        if (!rows.length) reject(`No data found.`);
        resolve(rows);
      }
    );
  });
};

const authorize = (credentials, callback) => {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
};

const getNewToken = (oAuth2Client, callback) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log(`Authorize this app by visiting this url: ${authUrl}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          `Error while trying to retrieve access token ${err}`
        );

      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log(`Token stored to ${TOKEN_PATH}`);
      });

      callback(oAuth2Client);
    });
  });
};
