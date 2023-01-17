const fs = require("fs");
const prompt = require("prompt-sync")();

const { initializeDatabase } = require("./google/google");

const formatData = (rows) => {
  const dataStore = [];
  let uniqueWords = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (row[0] !== "") {
      dataStore.push({
        word: row[0],
        meanings: [row[1]],
        sentences: [row[2]],
      });
      ++uniqueWords;
    } else {
      if (row[1] !== "") dataStore[uniqueWords - 1].meanings.push(row[1]);
      if (row[2] !== "") dataStore[uniqueWords - 1].sentences.push(row[2]);
    }
  }

  return dataStore;
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
};

const runFlashCardsGame = async (dataStore) => {
  const uniqueWords = dataStore.length;
  if (uniqueWords <= 0) return console.log("Error! No Data found!");

  const SESSION_LENGTH = 5;

  while (true) {
    console.log("-----------------------------------------------------------");
    const cont = prompt("Do you want to continue ?\n0 = NO\n1 = YES\n");
    if (cont === "0") break;

    console.log("-----------------------------------------------------------");
    for (let i = 0; i < SESSION_LENGTH; i++) {
      console.log("                ------------------                ");
      const rand = getRandomInt(0, uniqueWords);

      const store = dataStore[rand];

      console.log(`\nThe word is: ${store.word}`);

      prompt("\nShow it's meaning?");

      store.meanings.forEach((meaning) => console.log(meaning));

      prompt("\nCan you think of a sentence?");

      store.sentences.forEach((sentence) => console.log(sentence));
    }
    console.log("                ------------------                ");
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

    runFlashCardsGame(dataStore);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
