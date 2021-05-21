import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WdfModule } from '../wdf.module.js';
import { WdfWorkplacesSummaryTableComponent } from './wdf-workplaces-summary-table.component';

describe('WdfWorkplacesSummaryTableComponent', () => {
  const workplaces = [
    {
      name: 'Workplace name',
      wdf: {
        overall: true,
        staff: true,
        workplace: true,
      },
    },
    {
      name: 'Workplace name 2',
      wdf: {
        overall: true,
        staff: true,
        workplace: true,
      },
    },
  ];

  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(
      WdfWorkplacesSummaryTableComponent,
      {
        imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, WdfModule],
        providers: [],
        componentProperties: {
          workplaces: workplaces,
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

  it('should display two green ticks for each workplace when the workplace has qualified for WDF and the workplace and staff records are eligible', async () => {
    const { component, fixture, getAllByText } = await setup();
    const greenTickVisuallyHiddenMessage = 'Green tick';
    const meetingMessage = 'Meeting';

    component.workplaces[0].wdf.overall = true;
    component.workplaces[0].wdf.workplace = true;
    component.workplaces[0].wdf.staff = true;

    component.workplaces[1].wdf.overall = true;
    component.workplaces[1].wdf.workplace = true;
    component.workplaces[1].wdf.staff = true;
    fixture.detectChanges();

    expect(getAllByText(greenTickVisuallyHiddenMessage, { exact: false }).length).toBe(4);
    expect(getAllByText(meetingMessage, { exact: true }).length).toBe(4);
  });

  describe('sortByColumn', async () => {
    it('should put workplaces not meeting WDF at top of table when sorting by WDF requirements (not meeting)', async () => {
      const { component, fixture } = await setup();

      component.workplaces[0].wdf.overall = true;
      component.workplaces[0].wdf.workplace = true;
      component.workplaces[0].wdf.staff = true;

      component.workplaces[1].wdf.overall = false;
      component.workplaces[1].wdf.workplace = false;
      component.workplaces[1].wdf.staff = false;

      fixture.componentInstance.sortByColumn('1_not_meeting');
      const workplaces = component.workplaces;
      fixture.detectChanges();

      expect(workplaces[0].wdf.overall).toEqual(false);
      expect(workplaces[1].wdf.overall).toEqual(true);
    });

    it('should put workplaces not meeting WDF for either workplace or staff record at top of table when sorting by WDF requirements (not meeting)', async () => {
      const { component, fixture } = await setup();

      component.workplaces[0].wdf.overall = true;
      component.workplaces[0].wdf.workplace = false;
      component.workplaces[0].wdf.staff = true;

      component.workplaces[1].wdf.overall = true;
      component.workplaces[1].wdf.workplace = false;
      component.workplaces[1].wdf.staff = false;

      fixture.componentInstance.sortByColumn('1_not_meeting');
      const workplaces = component.workplaces;
      fixture.detectChanges();

      expect(workplaces[0].wdf.workplace).toEqual(false);
      expect(workplaces[0].wdf.staff).toEqual(false);
      expect(workplaces[1].wdf.workplace).toEqual(false);
      expect(workplaces[1].wdf.staff).toEqual(true);
    });

    it('should put workplaces not meeting WDF (red crosses) before those meeting with changes (orange flags) when sorting by WDF requirements (not meeting)', async () => {
      const { component, fixture } = await setup();

      component.workplaces[0].wdf.overall = false;
      component.workplaces[0].wdf.workplace = true;
      component.workplaces[0].wdf.staff = false;

      component.workplaces[1].wdf.overall = true;
      component.workplaces[1].wdf.workplace = false;
      component.workplaces[1].wdf.staff = true;

      fixture.componentInstance.sortByColumn('1_not_meeting');
      const workplaces = component.workplaces;
      fixture.detectChanges();

      expect(workplaces[0].wdf.overall).toEqual(false);
      expect(workplaces[0].wdf.workplace).toEqual(true);
      expect(workplaces[0].wdf.staff).toEqual(false);

      expect(workplaces[1].wdf.overall).toEqual(true);
      expect(workplaces[1].wdf.workplace).toEqual(false);
      expect(workplaces[1].wdf.staff).toEqual(true);
    });

    it('should put workplaces meeting WDF with changes (orange flags) before those not meeting (red crosses) when sorting by WDF requirements (meeting)', async () => {
      const { component, fixture } = await setup();

      component.workplaces[0].wdf.overall = false;
      component.workplaces[0].wdf.workplace = false;
      component.workplaces[0].wdf.staff = false;

      component.workplaces[1].wdf.overall = true;
      component.workplaces[1].wdf.workplace = false;
      component.workplaces[1].wdf.staff = true;

      fixture.componentInstance.sortByColumn('2_meeting');
      const workplaces = component.workplaces;
      fixture.detectChanges();

      expect(workplaces[0].wdf.overall).toEqual(true);
      expect(workplaces[0].wdf.workplace).toEqual(false);
      expect(workplaces[0].wdf.staff).toEqual(true);

      expect(workplaces[1].wdf.overall).toEqual(false);
      expect(workplaces[1].wdf.workplace).toEqual(false);
      expect(workplaces[1].wdf.staff).toEqual(false);
    });
  });
});
