import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AdminModule } from '../admin.module';
import { ParentRequestsListComponent } from './parent-requests-list.component';

describe('ParentRequestsListComponent', () => {
  async function setup() {
    const component = await render(ParentRequestsListComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, AdminModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                parentRequests: [
                  {
                    establishmentId: 2353,
                    establishmentUid: 'ahfhf678-bbe8-483a-a58c-d1f799aad878',
                    orgName: 'Workplace 1',
                    requestId: 18,
                    requestUUID: 'a783838hd-817a-4a26-9823-764a8e715e8e',
                    requested: '2021-12-14T15:12:10.417Z',
                    userId: 1981,
                    userName: 'test',
                    workplaceId: 'F1003022',
                    status: 'Pending',
                  },
                  {
                    establishmentId: 1945,
                    establishmentUid: 'hfudhdne77-bbe8-483a-a58c-d1f799aad878',
                    orgName: 'Workplace 2',
                    requestId: 19,
                    requestUUID: 'hfeoj6473-817a-4a26-9823-764a8e715e8e',
                    requested: '2021-12-16T15:12:10.417Z',
                    userId: 1981,
                    userName: 'test',
                    workplaceId: 'F1003023',
                    status: 'In progress',
                  },
                ],
              },
            },
          },
        },
      ],
    });

    const fixture = component.fixture;

    return {
      fixture,
      component,
    };
  }

  it('should render a ParentRequestsListComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the title "Parent requests"', async () => {
    const { component } = await setup();

    expect(component.getByText('Parent requests')).toBeTruthy();
  });

  describe('Workplace 1', () => {
    it('should display the workplace name in the parent requests table', async () => {
      const { component } = await setup();

      const workplaceName = component.getByText('Workplace 1');
      expect(workplaceName).toBeTruthy();
    });

    it('should display the requested date in the parent requests table', async () => {
      const { component } = await setup();

      const requestedDate = component.getByText('14 Dec 2021');
      expect(requestedDate).toBeTruthy();
    });

    it('should display the status in the parent requests table', async () => {
      const { component } = await setup();

      const status = component.getByText('PENDING');
      expect(status).toBeTruthy();
      expect(status.getAttribute('class')).toContain('govuk-tag--grey');
    });

    it('should contain a link on the first workplace name', async () => {
      const { fixture } = await setup();

      const workplaceName1 = fixture.debugElement.query(
        By.css('[data-testid="workplaceName-ahfhf678-bbe8-483a-a58c-d1f799aad878"]'),
      ).nativeElement;
      expect(workplaceName1.getAttribute('href')).toBe(
        '/sfcadmin/parent-requests/ahfhf678-bbe8-483a-a58c-d1f799aad878',
      );
    });
  });

  describe('Workplace 2', () => {
    it('should display the second workplace name in the parent requests table', async () => {
      const { component } = await setup();

      const workplaceName = component.getByText('Workplace 2');
      expect(workplaceName).toBeTruthy();
    });

    it('should display the second workplace requested date in the parent requests table', async () => {
      const { component } = await setup();

      const requestedDate = component.getByText('16 Dec 2021');
      expect(requestedDate).toBeTruthy();
    });

    it('should display the second workplace status in the parent requests table', async () => {
      const { component } = await setup();

      const status = component.getByText('IN PROGRESS');
      expect(status).toBeTruthy();
      expect(status.getAttribute('class')).toContain('govuk-tag--blue');
    });

    it('should contain a link on the second workplace name', async () => {
      const { fixture } = await setup();

      const workplaceName2 = fixture.debugElement.query(
        By.css('[data-testid="workplaceName-hfudhdne77-bbe8-483a-a58c-d1f799aad878"]'),
      ).nativeElement;
      expect(workplaceName2.getAttribute('href')).toBe(
        '/sfcadmin/parent-requests/hfudhdne77-bbe8-483a-a58c-d1f799aad878',
      );
    });
  });
});
