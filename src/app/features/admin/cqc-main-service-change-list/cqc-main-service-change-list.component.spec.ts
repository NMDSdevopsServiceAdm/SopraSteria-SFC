import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AdminModule } from '../admin.module';
import { CQCMainServiceChangeListComponent } from './cqc-main-service-change-list.component';

describe('CQCMainServiceChangeListComponent', () => {
  async function setup() {
    const component = await render(CQCMainServiceChangeListComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, AdminModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                cqcStatusChangeList: [
                  {
                    orgName: 'Workplace 1',
                    status: 'Pending',
                    requested: new Date('01/01/2021'),
                    establishmentUid: 'ajfkdk890809',
                  },
                  {
                    orgName: 'Workplace 2',
                    status: 'In progress',
                    requested: new Date('02/01/2021'),
                    establishmentUid: 'ajfkdk8908678',
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

  it('should render a CQCMainServiceChangeListComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show `CQC main service change` header', async () => {
    const { component } = await setup();

    expect(component.getByText('CQC main service change')).toBeTruthy();
  });

  it('should render the pending and in progess cqc main service change when first loading page', async () => {
    const { component } = await setup();

    const workplace1Name = component.queryByText('Workplace 1');
    const workplace1Status = component.queryByText('PENDING');
    const workplace1Requested = component.queryByText('01 Jan 2021', { exact: false });

    const workplace2Name = component.queryByText('Workplace 2');
    const workplace2Status = component.queryByText('IN PROGRESS');
    const workplace2Requested = component.queryByText('01 Feb 2021', { exact: false });

    expect(workplace1Name).toBeTruthy();
    expect(workplace1Status).toBeTruthy();
    expect(workplace1Requested).toBeTruthy();

    expect(workplace2Name).toBeTruthy();
    expect(workplace2Status).toBeTruthy();
    expect(workplace2Requested).toBeTruthy();
  });

  it('should give status a conditional class for different values', async () => {
    const { component } = await setup();

    const workplace1Status = component.getByText('PENDING');
    const workplace2Status = component.getByText('IN PROGRESS');

    expect(workplace1Status.getAttribute('class')).toContain('govuk-tag--grey');
    expect(workplace2Status.getAttribute('class')).toContain('govuk-tag--blue');
  });

  it('should contain link in workplace name ', async () => {
    const { component, fixture } = await setup();
    fixture.detectChanges();
    const workplaceName1 = fixture.debugElement.query(
      By.css('[data-testid="workplaceName-ajfkdk890809"]'),
    ).nativeElement;
    expect(workplaceName1.getAttribute('href')).toBe('/sfcadmin/cqc-main-service-change/ajfkdk890809');
  });

  it('should contain link in seconf workplace name ', async () => {
    const { component, fixture } = await setup();
    fixture.detectChanges();

    const workplaceName2 = fixture.debugElement.query(
      By.css('[data-testid="workplaceName-ajfkdk8908678"]'),
    ).nativeElement;

    expect(workplaceName2.getAttribute('href')).toBe('/sfcadmin/cqc-main-service-change/ajfkdk8908678');
  });
});
