const fs = require("fs");
const prompt = require("prompt-sync")();
require("dotenv").config();

const { initializeDatabase } = require("./google/google");
const { getSynonymsAndAntonyms } = require("./thesaurus");
const { getNRandomNumbersInRange } = require("./utils");

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

const runFlashCardsGame = async (dataStore) => {
  const uniqueWords = dataStore.length;
  if (uniqueWords <= 0) return console.log("Error! No Data found!");

  const SESSION_LENGTH = 5;

  while (true) {
    console.log("-----------------------------------------------------------");
    const cont = prompt("Do you want to continue ?\n0 = NO\n1 = YES\n");
    if (cont === "0") break;

    console.log("-----------------------------------------------------------");

    const randomIndexes = getNRandomNumbersInRange(
      0,
      uniqueWords,
      SESSION_LENGTH
    );

    for (let i = 0; i < SESSION_LENGTH; i++) {
      console.log("                ------------------                ");

      // Displaying the Word
      const rand = randomIndexes[i];
      const store = dataStore[rand];
      console.log(`\nThe word is: ${store.word}`);

      // Showing it's meanings
      prompt("\nShow it's meaning?");
      store.meanings.forEach((meaning) => console.log(meaning));

      // Show Synonyms
      prompt(
        "\nCan you think of words similar in meaning to this (synonyms)?\n"
      );
      const relatedWords = await getSynonymsAndAntonyms(store.word);
      relatedWords.synonyms.forEach((synonym) => console.log(synonym));

      // Show Antonyms
      prompt(
        "\nCan you think of words different in meaning to this (antonyms)?\n"
      );
      relatedWords.antonyms.forEach((antonym) => console.log(antonym));

      // Showing Example Sentences
      prompt("\nCan you think of a sentence?\n");
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

    await runFlashCardsGame(dataStore);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
