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

    let toSendSynonyms;
    let toSendAntonyms;

    if (synonyms.length > n) {
      const toSendSynonymsIndexes = getNRandomNumbersInRange(
        0,
        synonyms.length,
        n
      );

      toSendSynonyms = synonyms.filter((synonym, index) => {
        return toSendSynonymsIndexes.includes(index);
      });
    } else {
      toSendSynonyms = synonyms;
    }

    const toSendAntonymsIndexes = getNRandomNumbersInRange(
      0,
      antonyms.length,
      n
    );

    if (antonyms.length > n) {
      toSendAntonyms = antonyms.filter((antonym, index) => {
        return toSendAntonymsIndexes.includes(index);
      });
    } else {
      toSendAntonyms = antonyms;
    }

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
