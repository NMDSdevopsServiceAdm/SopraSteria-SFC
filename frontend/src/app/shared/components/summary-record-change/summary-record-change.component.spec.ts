import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SummaryRecordChangeComponent } from './summary-record-change.component';

describe('SummaryRecordChangeComponent', () => {
  async function setup(overrides: any = {}) {
    const explanationText = overrides?.explanationText ?? ' test';
    const link = [];
    const hasData = overrides?.hasData ?? false;
    const overrideLabelText = overrides?.overrideLabelText ?? null;
    const setupTools = await render(SummaryRecordChangeComponent, {
      imports: [SharedModule, RouterModule],
      declarations: [],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
      componentProperties: {
        explanationText,
        link,
        hasData,
        overrideLabelText,
      },
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  }

  it('should render a SummaryRecordChangeComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render Change when it has data', async () => {
    const { queryByText } = await setup({ hasData: true });
    expect(queryByText('Change')).toBeTruthy();
  });

  it('should render Add information when it doesnt has data', async () => {
    const { queryByText } = await setup({ hasData: false });
    expect(queryByText('Add')).toBeTruthy();
  });

  it('should render the screen reader text', async () => {
    const { queryByText } = await setup({ hasData: false });
    expect(queryByText('test')).toBeTruthy();
  });

  it('should render the given label text when overrideLabelText is provided and hasData is true', async () => {
    const { queryByText } = await setup({ overrideLabelText: 'Review and confirm', hasData: true });
    expect(queryByText('Review and confirm')).toBeTruthy();
  });

  it('should render the given label text when overrideLabelText is provided and hasData is false', async () => {
    const { queryByText } = await setup({ overrideLabelText: 'Review and confirm', hasData: false });
    expect(queryByText('Review and confirm')).toBeTruthy();
  });
});
