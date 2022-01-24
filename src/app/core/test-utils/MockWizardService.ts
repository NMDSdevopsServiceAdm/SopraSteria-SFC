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
          image: 'imageUrl',
          video: 'videoUrl',
          benchmarksFlag: false,
        },
        {
          title: 'Benchmarks',
          content: 'Test benchmarks content',
          id: 2,
          image: 'imageUrl',
          video: '',
          benchmarksFlag: true,
        },
        {
          title: 'Staff records',
          content: 'Test staff records content',
          id: 3,
          image: 'imageUrl',
          video: 'videoUrl',
          benchmarksFlag: false,
        },
      ],
    };
  }
}
