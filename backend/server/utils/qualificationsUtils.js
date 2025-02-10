module.exports.formatQualificationTitle = (title, level) => {
  if (level) {
    if (!parseInt(level)) {
      return `${title} ${level}`;
    }

    if (title.endsWith(')')) {
      const sub = title.substring(0, title.length - 1);
      return `${sub}, level ${level})`;
    }

    return `${title} (level ${level})`;
  }
  return title;
};
