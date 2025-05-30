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

      expect(workplaceFlowProgressBarSections.length).toEqual(4);
    });

    it('should return the correct values', () => {
      const workplaceFlowProgressBarSections = ProgressBarUtil.workplaceFlowProgressBarSections();

      expect(workplaceFlowProgressBarSections).toEqual([
        'Services',
        'Vacancies and turnover',
        'Recruitment and benefits',
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
});
