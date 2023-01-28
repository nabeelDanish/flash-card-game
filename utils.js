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
