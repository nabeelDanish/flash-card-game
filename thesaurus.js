const axios = require("axios");

const { getNRandomNumbersInRange } = require("./utils");

const API_KEY = process.env.THESAURUS_KEY;
const THESAURUS_URL =
  "https://www.dictionaryapi.com/api/v3/references/thesaurus/json";

exports.getSynonymsAndAntonyms = async (word, n = 3) => {
  try {
    const response = await axios.get(
      `${THESAURUS_URL}/${word.toLowerCase()}?key=${API_KEY}`
    );

    const data = response.data[0];

    const synonyms = data.meta.syns[0];
    const antonyms = data.meta.ants[0];

    if (!synonyms || !antonyms)
      return {
        synonyms: [],
        antonyms: [],
      };

    const toSendSynonymsIndexes = getNRandomNumbersInRange(
      0,
      synonyms.length,
      n
    );
    const toSendAntonymsIndexes = getNRandomNumbersInRange(
      0,
      antonyms.length,
      n
    );

    const toSendSynonyms = synonyms.filter((synonym, index) => {
      return toSendSynonymsIndexes.includes(index);
    });

    const toSendAntonyms = antonyms.filter((antonym, index) => {
      return toSendAntonymsIndexes.includes(index);
    });

    return {
      synonyms: toSendSynonyms,
      antonyms: toSendAntonyms,
    };
  } catch (error) {
    console.error(error);
    return {
      synonyms: [],
      antonyms: [],
    };
  }
};
