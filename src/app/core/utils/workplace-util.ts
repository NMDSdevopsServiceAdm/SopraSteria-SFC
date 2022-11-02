export class WorkplaceUtil {
  public static formatTypeOfEmployer(employerType: string): string {
    const typeOfEmployerOptions = [
      { value: 'Local Authority (adult services)', text: 'Local authority (adult services)' },
      { value: 'Local Authority (generic/other)', text: 'Local authority (generic, other)' },
      { value: 'Private Sector', text: 'Private sector' },
      { value: 'Voluntary / Charity', text: 'Voluntary, charity, not for profit' },
      { value: 'Other', text: 'Other' },
    ];

    const typeOfEmployerObj = typeOfEmployerOptions.find(
      (typeOfEmployer) => typeOfEmployer.value.toLowerCase() === employerType.toLowerCase(),
    );

    return typeOfEmployerObj?.text;
  }
}
