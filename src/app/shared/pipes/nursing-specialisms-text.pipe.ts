import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nursingSpecialismsText',
})
export class NursingSpecialismsTextPipe implements PipeTransform {
  public nursingSpecialisms = [
    {
      value: 'Older people (including dementia, elderly care and end of life care)',
      text: 'Older people (including dementia, elderly care and end of life care)',
    },
    { value: 'Adults', text: 'Adult nursing' },
    { value: 'Learning Disability', text: 'Learning disability nursing' },
    { value: 'Mental Health', text: 'Mental health nursing' },
    { value: 'Community Care', text: 'Community care' },
    { value: 'Others', text: 'Other specialisms' },
  ];

  transform(value: string): string {
    const nursingSpecialism = this.nursingSpecialisms.find((cat) => cat.value === value);
    return nursingSpecialism ? nursingSpecialism.text : '';
  }
}
