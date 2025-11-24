describe('workerTraining model', () => {
  describe('autoFillInExpiryDate', () => {
    it('should update the expiry date of a training record, calculated from the completion date and validityPeriodInMonth', () => {
      throw new Error('to be implemented');
    });

    it('should not update the record if expiry date is already filled in');

    it('should not update the record if completion date is missing');

    it('should not update the record if validityPeriodInMonth is missing');

    it('should throw NotFoundError if could not find a training record with the given ID');
  });

  describe('updateRecordsWithTrainingCourse', () => {
    it('should update multiple training record with the data from trainingCourse');

    it('should exclude training records that are already linked to other training course');

    it('should exclude training records that are not belongs to worker of the same establishment');

    it('should exclude training records that are already linked to other training course');
  });
});
