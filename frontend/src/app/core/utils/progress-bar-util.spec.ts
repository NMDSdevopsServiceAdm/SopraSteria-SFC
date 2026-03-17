import { ProgressBarUtil } from './progress-bar-util';

describe('ProgressBarUtil', () => {
  describe('workplaceProgressBarSections', () => {
    it('should return an array with a length of 6', () => {
      const workplaceProgressBarSections = ProgressBarUtil.workplaceProgressBarSections();

      expect(workplaceProgressBarSections.length).toEqual(6);
    });

    it('should return the correct values', () => {
      const workplaceProgressBarSections = ProgressBarUtil.workplaceProgressBarSections();

      expect(workplaceProgressBarSections).toEqual([
        'CQC regulated',
        'Find workplace',
        'Confirm workplace',
        'Employer type',
        'Main service',
        'Number of staff',
      ]);
    });
  });

  describe('userProgressBarSections', () => {
    it('should return an array with a length of 3', () => {
      const userProgressBarSections = ProgressBarUtil.userProgressBarSections();

      expect(userProgressBarSections.length).toEqual(3);
    });

    it('should return the correct values', () => {
      const userProgressBarSections = ProgressBarUtil.userProgressBarSections();

      expect(userProgressBarSections).toEqual(['User details', 'Username and password', 'Security question']);
    });
  });

  describe('workplaceFlowProgressBarSections', () => {
    it('should return an array with a length of 5', () => {
      const workplaceFlowProgressBarSections = ProgressBarUtil.workplaceFlowProgressBarSections();

      expect(workplaceFlowProgressBarSections.length).toEqual(5);
    });

    it('should return the correct values', () => {
      const workplaceFlowProgressBarSections = ProgressBarUtil.workplaceFlowProgressBarSections();

      expect(workplaceFlowProgressBarSections).toEqual([
        'Services',
        'Vacancies and turnover',
        'Pay and benefits',
        'Staff development',
        'Permissions',
      ]);
    });
  });

  describe('staffRecordProgressBarSections', () => {
    it('should return an array with a length of 4', () => {
      const staffRecordProgressBarSections = ProgressBarUtil.staffRecordProgressBarSections();

      expect(staffRecordProgressBarSections.length).toEqual(4);
    });

    it('should return the correct values', () => {
      const staffRecordProgressBarSections = ProgressBarUtil.staffRecordProgressBarSections();

      expect(staffRecordProgressBarSections).toEqual([
        'Mandatory information',
        'Personal details',
        'Employment details',
        'Training and qualifications',
      ]);
    });
  });

  describe('payAndPensionsMiniFlowGroup2BarSections', () => {
    it('should return an array with the length 3', async () => {
      const payAndPensionsMiniFlowGroup2BarSections = ProgressBarUtil.payAndPensionsMiniFlowGroup2BarSections();

      expect(payAndPensionsMiniFlowGroup2BarSections.length).toEqual(3);
    });

    it('should return the correct values', () => {
      const payAndPensionsMiniFlowGroup2BarSections = ProgressBarUtil.payAndPensionsMiniFlowGroup2BarSections();

      expect(payAndPensionsMiniFlowGroup2BarSections).toEqual(['Question 1', 'Question 2', 'Question 3']);
    });
  });

  describe('payAndPensionsMiniFlowBarSections', () => {
    it('should return an array with the default length 3 and values when nothing is sent', async () => {
      const payAndPensionsMiniFlowBarSections = ProgressBarUtil.payAndPensionsMiniFlowBarSections();

      expect(payAndPensionsMiniFlowBarSections.length).toEqual(3);
      expect(payAndPensionsMiniFlowBarSections).toEqual(['Question 1', 'Question 2', 'Question 3']);
    });

    it('should return an array with the default length 3 and values when 2 is sent', async () => {
      const payAndPensionsMiniFlowBarSections = ProgressBarUtil.payAndPensionsMiniFlowBarSections(2);

      expect(payAndPensionsMiniFlowBarSections.length).toEqual(3);
      expect(payAndPensionsMiniFlowBarSections).toEqual(['Question 1', 'Question 2', 'Question 3']);
    });

    it('should return an array with the length 4 and correct values when 4 is sent', async () => {
      const payAndPensionsMiniFlowBarSections = ProgressBarUtil.payAndPensionsMiniFlowBarSections(4);

      expect(payAndPensionsMiniFlowBarSections.length).toEqual(4);
      expect(payAndPensionsMiniFlowBarSections).toEqual(['Question 1', 'Question 2', 'Question 3', 'Question 4']);
    });
  });
});
