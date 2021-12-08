import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CQCMainServiceChangeListComponent } from './cqc-main-service-change-list.component';

describe('CQCMainServiceChangeListComponent', () => {
  async function setup() {
    const component = await render(CQCMainServiceChangeListComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                cqcStatusChangeList: [
                  {
                    orgName: 'Workplace 1',
                    status: 'PENDING',
                    requested: '30/6/2021 2:11pm',
                  },
                  {
                    orgName: 'Workplace 2',
                    status: 'IN PROGRESS',
                    requested: '24/6/2020 12:06pm',
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

  it('should show `CQC main service change` table headings', async () => {
    const { component } = await setup();

    expect(component.getByText('Workplace')).toBeTruthy();
    expect(component.getByText('Received')).toBeTruthy();
    expect(component.getByText('Status')).toBeTruthy();
  });

  it('should render the pending and in progess cqc main service change when first loading page', async () => {
    const { component } = await setup();

    const workplace1Name = component.queryByText('Workplace 1');
    const workplace1Status = component.queryByText('PENDING');
    const workplace1Requested = component.queryByText('30/6/2021 2:11pm');

    const workplace2Name = component.queryByText('Workplace 2');
    const workplace2Status = component.queryByText('IN PROGRESS');
    const workplace2Requested = component.queryByText('24/6/2020 12:06pm');

    expect(workplace1Name).toBeTruthy();
    expect(workplace1Status).toBeTruthy();
    expect(workplace1Requested).toBeTruthy();

    expect(workplace2Name).toBeTruthy();
    expect(workplace2Status).toBeTruthy();
    expect(workplace2Requested).toBeTruthy();
  });
});
