import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WdfModule } from '../wdf.module.js';
import { WdfWorkplacesSummaryTableComponent } from './wdf-workplaces-summary-table.component';

describe('WdfWorkplacesSummaryTableComponent', () => {
  const workplace = {
    name: 'Workplace name',
    wdf: {
      overall: true,
      staff: true,
      workplace: true,
    },
  };

  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(
      WdfWorkplacesSummaryTableComponent,
      {
        imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, WdfModule],
        providers: [],
        componentProperties: {
          workplaces: [workplace],
        },
      },
    );
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  it('should render a WdfWorkplacesSummaryTableComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display two green ticks when the workplace has qualified for WDF and the workplace and staff records are eligible', async () => {
    const { component, fixture, getAllByText } = await setup();
    const greenTickVisuallyHiddenMessage = 'Green tick';
    const meetingMessage = 'Meeting';

    component.workplaces[0].wdf.overall = true;
    component.workplaces[0].wdf.workplace = true;
    component.workplaces[0].wdf.staff = true;
    fixture.detectChanges();

    expect(getAllByText(greenTickVisuallyHiddenMessage, { exact: false }).length).toBe(2);
    expect(getAllByText(meetingMessage, { exact: true }).length).toBe(2);
  });
});
