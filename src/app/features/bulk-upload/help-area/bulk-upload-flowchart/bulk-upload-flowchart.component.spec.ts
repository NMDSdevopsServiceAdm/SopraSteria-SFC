import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { BulkUploadFlowchartComponent } from './bulk-upload-flowchart.component';

describe('BulkUploadFlowchartComponent', () => {
  async function setup() {
    const { fixture, getByTestId, getByText } = await render(BulkUploadFlowchartComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [],
    });

    const component = fixture.componentInstance;
    return {
      component,
      getByTestId,
      getByText,
      fixture,
    };
  }
  it('should render a BulkUploadPageComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the title and the flowchart', async () => {
    const { getByTestId } = await setup();

    const heading = getByTestId('heading');
    expect(heading).toBeTruthy();
  });

  it('should show a download link', async () => {
    const { getByText } = await setup();

    const downloadLink = getByText('Download bulk upload guide');
    expect(downloadLink).toBeTruthy();
  });

  it('should set the back link', async () => {
    const { component, fixture } = await setup();
    const backLinkSpy = spyOn(component.backService, 'setBackLink');

    component.setBackLink();
    fixture.detectChanges();

    expect(backLinkSpy).toHaveBeenCalledWith({ url: ['/bulk-upload', 'get-help'] });
  });
});
