const sanitise = (rawQuery) => {
  return rawQuery.trim().replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_');
};

module.exports.sanitise = sanitise;
