module.exports.calculateRankDesc = function (score, otherScores) {
  const sort = (scores) => scores.sort((a, b) => b - a);
  const compare = (a, b) => a < b;
  return calculateRank(score, otherScores, sort, compare);
};

module.exports.calculateRankAsc = function (score, otherScores) {
  const sort = (scores) => scores.sort((a, b) => a - b);
  const compare = (a, b) => a > b;
  return calculateRank(score, otherScores, sort, compare);
};

function calculateRank(score, otherScores, sort, compare) {
  if (score === null || score === undefined) {
    return null;
  }
  if (!otherScores) {
    return 1;
  }

  sort(otherScores);
  let i = 0;
  while (compare(score, otherScores[i]) && i < otherScores.length) {
    i++;
  }
  return i + 1;
}
