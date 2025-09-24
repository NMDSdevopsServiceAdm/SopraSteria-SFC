import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SummaryRecordChangeComponent } from './summary-record-change.component';

describe('SummaryRecordChangeComponent', () => {
  async function setup(explanationText = '', link = [], hasData = false) {
    const component = await render(SummaryRecordChangeComponent, {
      imports: [SharedModule, RouterModule],
      declarations: [],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
      componentProperties: {
        explanationText,
        link,
        hasData,
      },
    });

    return {
      component,
    };
  }

  it('should render a SummaryRecordChangeComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render Change when it has data', async () => {
    const { component } = await setup(' test', [], true);
    expect(component.queryByText).toBeTruthy();
  });

  it('should render Add information when it doesnt has data', async () => {
    const { component } = await setup(' test', [], false);
    expect(component.queryByText('Add')).toBeTruthy();
  });

  it('should render the screen reader text', async () => {
    const { component } = await setup(' test', [], false);
    expect(component.queryByText('test')).toBeTruthy();
  });
});
