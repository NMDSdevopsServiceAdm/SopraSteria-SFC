export class ProgressBarUtil {
  public static workplaceProgressBarSections = (): string[] => {
    return ['CQC regulated', 'Find workplace', 'Confirm workplace', 'Employer type', 'Main service', 'Number of staff'];
  };

  public static userProgressBarSections = (): string[] => {
    return ['User details', 'Username and password', 'Security question'];
  };

  public static workplaceFlowProgressBarSections = (): string[] => {
    return ['Services', 'Vacancies and turnover', 'Recruitment', 'Staff benefits', 'Permissions'];
  };

  public static recruitmentMiniFlowProgressBarSections = (): string[] => {
    return ['Advertising spend', 'People interviewed', 'Training', 'Care Certificates'];
  };

  public static staffBenefitsMiniFlowProgressBarSections = (): string[] => {
    return ['Loyalty bonus', 'Statutory Sick Pay', 'Pensions', 'Holiday leave'];
  };

  public static staffRecordMiniFlowProgressBarSections = (): string[] => {
    return ['Mandatory information', 'Personal details', 'Employment details', 'Training and qualifications'];
  };
}
