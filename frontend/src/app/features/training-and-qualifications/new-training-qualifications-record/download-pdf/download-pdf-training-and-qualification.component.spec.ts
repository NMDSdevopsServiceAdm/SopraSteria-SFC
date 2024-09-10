import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { DownloadPdfTrainingAndQualificationComponent } from './download-pdf-training-and-qualification.component';

describe('DownloadPdfTrainingAndQualificationComponent', () => {
  async function setup() {
    const { fixture } = await render(DownloadPdfTrainingAndQualificationComponent, {
      imports: [SharedModule],
      providers: [],
      componentProperties: {},
    });

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
