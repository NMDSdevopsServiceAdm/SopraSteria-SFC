import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nursingCategoriesText',
})
export class NursingCategoriesTextPipe implements PipeTransform {
  public nursingCategories = [
    { value: 'Adult Nurse', text: 'Adult nursing' },
    { value: 'Mental Health Nurse', text: 'Mental health nursing' },
    { value: 'Learning Disabilities Nurse', text: 'Learning disability nursing' },
    { value: `Children's Nurse`, text: `Children's nursing` },
    { value: 'Enrolled Nurse', text: 'Enrolled Nurse' },
  ];

  transform(value: string): string {
    const nursingCategory = this.nursingCategories.find((cat) => cat.value === value);
    return nursingCategory ? nursingCategory.text : '';
  }
}
