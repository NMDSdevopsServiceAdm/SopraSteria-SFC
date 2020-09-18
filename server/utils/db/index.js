const sanitise = (rawQuery) => {
  return rawQuery.replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_');
};

module.exports.sanitise = sanitise;
