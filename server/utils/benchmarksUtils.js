module.exports.calculateRank = function (score, otherScores) {
  if (!score) {
    return null;
  }
  if (!otherScores) {
    return 1;
  }

  otherScores.sort((a, b) => b - a);
  let i = 0;
  while (score < otherScores[i] && i < otherScores.length) {
    i++;
  }
  return i + 1;
};
