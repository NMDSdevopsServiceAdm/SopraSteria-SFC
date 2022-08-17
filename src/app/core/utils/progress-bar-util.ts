export class ProgressBarUtil {
  public static workplaceProgressBarSections = (): string[] => {
    return ['CQC regulated', 'Find workplace', 'Confirm workplace', 'Employer type', 'Main service', 'Number of staff'];
  };

  public static userProgressBarSections = (): string[] => {
    return ['User details', 'Username and password', 'Security question'];
  };
}
