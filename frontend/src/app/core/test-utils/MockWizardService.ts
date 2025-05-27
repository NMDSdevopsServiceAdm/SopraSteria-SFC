import { Injectable } from '@angular/core';
import { Wizards } from '@core/model/wizard.model';
import { WizardService } from '@core/services/wizard.service';

@Injectable()
export class MockWizardService extends WizardService {
  public static wizardFactory(): Wizards {
    return {
      data: [
        {
          title: 'Workplace',
          content: 'Test workplace content',
          id: 1,
          image: 'imageUrl0',
          video: 'videoUrl',
          benchmarksFlag: false,
        },
        {
          title: 'Benchmarks',
          content: 'Test benchmarks content',
          id: 2,
          image: 'imageUrl1',
          video: '',
          benchmarksFlag: true,
        },
        {
          title: 'Staff records Title',
          content: 'Test staff records content',
          id: 3,
          image: 'imageUrl2',
          video: 'videoUrl',
          benchmarksFlag: false,
        },
        {
          title: 'Training and qualifications',
          content: 'Test training and quals content',
          id: 4,
          image: 'imageUrl3',
          video: 'videoUrl',
          benchmarksFlag: false,
        },
      ],
    };
  }
}
