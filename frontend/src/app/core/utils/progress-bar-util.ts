export class ProgressBarUtil {
  public static workplaceProgressBarSections = (): string[] => {
    return ['CQC regulated', 'Find workplace', 'Confirm workplace', 'Employer type', 'Main service', 'Number of staff'];
  };

  public static userProgressBarSections = (): string[] => {
    return ['User details', 'Username and password', 'Security question'];
  };

  public static workplaceFlowProgressBarSections = (): string[] => {
    return [
      WorkplaceFlowSections.SERVICES,
      WorkplaceFlowSections.VACANCIES_AND_TURNOVER,
      WorkplaceFlowSections.RECRUITMENT_AND_BENEFITS,
      WorkplaceFlowSections.PERMISSIONS,
    ];
  };

  public static staffRecordProgressBarSections = (): string[] => {
    return ['Mandatory information', 'Personal details', 'Employment details', 'Training and qualifications'];
  };
}

export enum WorkplaceFlowSections {
  SERVICES = 'Services',
  VACANCIES_AND_TURNOVER = 'Vacancies and turnover',
  RECRUITMENT_AND_BENEFITS = 'Recruitment and benefits',
  PERMISSIONS = 'Permissions',
}
