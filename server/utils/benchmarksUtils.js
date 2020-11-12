module.exports.calculateRank = function(score, otherScores) {
  if (!score) {
    return null;
  }
  let rank = 1;
  if (otherScores) {
    otherScores = otherScores.sort((a, b) => b - a);
    for (let i = 0; i < otherScores.length; i++) {
      if (score >= otherScores[i]) {
        break;
      }
      rank++;
    }
  }
  return rank;
}
