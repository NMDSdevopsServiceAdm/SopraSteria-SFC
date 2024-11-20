import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { DataPermissions, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WdfModule } from '../wdf.module';
import { WdfWorkplacesSummaryTableComponent } from './wdf-workplaces-summary-table.component';

describe('WdfWorkplacesSummaryTableComponent', () => {
  const overallEligible = {
    overall: true,
    staff: true,
    workplace: true,
  };

  const allIneligible = {
    overall: false,
    staff: false,
    workplace: false,
  };

  const mockWorkplaces = (): any[] => [
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

  const setup = async (overrides: any = {}) => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(
      WdfWorkplacesSummaryTableComponent,
      {
        imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, WdfModule],
        providers: [],
        componentProperties: {
          workplaces: mockWorkplaces(),
          ...overrides,
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
    const workplaces = mockWorkplaces();
    workplaces[0].wdf = overallEligible;
    workplaces[1].wdf = overallEligible;

    const { getAllByText } = await setup({ workplaces });
    const greenTickVisuallyHiddenMessage = 'Green tick';
    const meetingMessage = 'Meeting';

    expect(getAllByText(greenTickVisuallyHiddenMessage, { exact: false }).length).toBe(4);
    expect(getAllByText(meetingMessage, { exact: true }).length).toBe(4);
  });

  it('should not display a link for workplaces without rights', async () => {
    const workplaces = mockWorkplaces();
    workplaces[0].isParent = false;
    workplaces[0].dataOwner = WorkplaceDataOwner.Workplace;
    workplaces[0].dataPermissions = DataPermissions.None;
    workplaces[0].name = 'Test Workplace';

    const { getAllByText } = await setup({ workplaces });

    expect(getAllByText('Test Workplace', { exact: false })[0].outerHTML).toContain('<p>');
  });

  it('should display a link for workplaces with rights to at least workplace', async () => {
    const workplaces = mockWorkplaces();
    workplaces[0].dataPermissions = DataPermissions.Workplace;
    workplaces[0].name = 'Test Workplace';
    workplaces[0].dataOwner = WorkplaceDataOwner.Workplace;

    const { getAllByText } = await setup({ workplaces });

    expect(getAllByText('Test Workplace', { exact: false })[0].outerHTML).toContain('</a>');
  });

  it('canViewWorkplace should return true if parent', async () => {
    const { component } = await setup();

    const workplace = component.workplaces[0];
    workplace.isParent = true;

    const canViewWorkplace = component.canViewWorkplace(workplace);
    expect(canViewWorkplace).toBeTruthy(true);
  });

  describe('sortByColumn', async () => {
    it('should put workplaces not meeting WDF at top of table when sorting by WDF requirements (not meeting)', async () => {
      const workplaces = mockWorkplaces();
      workplaces[0].wdf = overallEligible;
      workplaces[1].wdf = allIneligible;

      const { component, fixture } = await setup({ workplaces });

      fixture.componentInstance.sortByColumn('1_not_meeting');

      const sortedWorkplaces = component.workplaces;

      expect(sortedWorkplaces[0].wdf.overall).toEqual(false);
      expect(sortedWorkplaces[1].wdf.overall).toEqual(true);
    });

    it('should put workplaces not meeting for either workplace or staff record at top of table when sorting by funding requirements (not meeting)', async () => {
      const workplaces = mockWorkplaces();
      workplaces[0].wdf.overall = false;
      workplaces[0].wdf.workplace = false;
      workplaces[0].wdf.staff = true;

      workplaces[1].wdf = allIneligible;

      const { component, fixture } = await setup({ workplaces });

      fixture.componentInstance.sortByColumn('1_not_meeting');
      const sortedWorkplaces = component.workplaces;

      expect(sortedWorkplaces[0].wdf.workplace).toEqual(false);
      expect(sortedWorkplaces[0].wdf.staff).toEqual(false);
      expect(sortedWorkplaces[1].wdf.workplace).toEqual(false);
      expect(sortedWorkplaces[1].wdf.staff).toEqual(true);
    });

    it('should put workplaces not meeting (red flag) before those meeting with changes (orange flags) when sorting by funding requirements (not meeting)', async () => {
      const workplaces = mockWorkplaces();
      workplaces[0].wdf.overall = false;
      workplaces[0].wdf.workplace = true;
      workplaces[0].wdf.staff = false;

      workplaces[1].wdf.overall = true;
      workplaces[1].wdf.workplace = true;
      workplaces[1].wdf.staff = false;

      const { component, fixture } = await setup({ workplaces });

      fixture.componentInstance.sortByColumn('1_not_meeting');
      const sortedWorkplaces = component.workplaces;

      expect(sortedWorkplaces[0].wdf.overall).toEqual(false);
      expect(sortedWorkplaces[0].wdf.workplace).toEqual(true);
      expect(sortedWorkplaces[0].wdf.staff).toEqual(false);

      expect(sortedWorkplaces[1].wdf.overall).toEqual(true);
      expect(sortedWorkplaces[1].wdf.workplace).toEqual(true);
      expect(sortedWorkplaces[1].wdf.staff).toEqual(false);
    });

    it('should put workplaces meeting WDF with changes (orange flags) before those not meeting (red crosses) when sorting by WDF requirements (meeting)', async () => {
      const workplaces = mockWorkplaces();
      workplaces[0].wdf = allIneligible;

      workplaces[1].wdf.overall = true;
      workplaces[1].wdf.workplace = false;
      workplaces[1].wdf.staff = true;

      const { component, fixture } = await setup({ workplaces });

      fixture.componentInstance.sortByColumn('2_meeting');
      const sortedWorkplaces = component.workplaces;

      expect(sortedWorkplaces[0].wdf.overall).toEqual(true);
      expect(sortedWorkplaces[0].wdf.workplace).toEqual(false);
      expect(sortedWorkplaces[0].wdf.staff).toEqual(true);

      expect(sortedWorkplaces[1].wdf.overall).toEqual(false);
      expect(sortedWorkplaces[1].wdf.workplace).toEqual(false);
      expect(sortedWorkplaces[1].wdf.staff).toEqual(false);
    });
  });
});
