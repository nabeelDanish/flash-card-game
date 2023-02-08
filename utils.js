exports.getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
};

exports.getNRandomNumbersInRange = (min, max, n) => {
  const randNumbers = [];
  while (randNumbers.length < n) {
    const r = this.getRandomInt(min, max);
    if (!randNumbers.includes(r)) {
      randNumbers.push(r);
    }
  }
  return randNumbers;
};

exports.shuffle = (array) => {
  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

exports.formatData = (rows) => {
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

exports.sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
