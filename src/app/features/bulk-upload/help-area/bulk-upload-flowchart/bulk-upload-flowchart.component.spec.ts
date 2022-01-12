import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { BulkUploadFlowchartComponent } from './bulk-upload-flowchart.component';

describe('BulkUploadPageComponent', () => {
  async function setup() {
    const component = await render(BulkUploadFlowchartComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [BackService],
    });

    return {
      component,
    };
  }
  it('should render a BulkUploadPageComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the title and the flowchart', async () => {
    const { component } = await setup();

    const heading = component.getByTestId('heading');
    expect(heading).toBeTruthy();
  });
});
