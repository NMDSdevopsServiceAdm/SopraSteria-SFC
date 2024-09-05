

module.exports.formatQualificationTitle = (title, level) => {
  if (level) {
    if (title.endsWith(')')) {
      const sub = title.substring(0, title.length - 1);
      return `${sub}, level ${level})`;
    } else {
      return `${title} (level ${level})`;
    }
  }
  return title;
}