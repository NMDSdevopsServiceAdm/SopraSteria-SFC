exports.createWorkerKey = (localEstablishmentId, workerId) => {
  return ((localEstablishmentId || '') + (workerId || '')).replace(/\s/g, '');
};
