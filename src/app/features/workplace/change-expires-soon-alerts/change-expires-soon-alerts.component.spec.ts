import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WorkplaceModule } from '../workplace.module';
import { ChangeExpiresSoonAlertsComponent } from './change-expires-soon-alerts.component';

fdescribe('ChangeExpiresSoonAlertsComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText } = await render(ChangeExpiresSoonAlertsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkplaceModule],
      providers: [
        // {
        //   provide: ActivatedRoute,
        //   useValue: new MockActivatedRoute({
        //     snapshot: {
        //       params: { trainingRecordId: '1' },
        //     },
        //     parent: {
        //       snapshot: {
        //         data: {
        //           establishment: {
        //             uid: '1',
        //           },
        //         },
        //       },
        //     },
        //   }),
        // },
      ],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();

    // const router = injector.inject(Router) as Router;
    // const spy = spyOn(router, 'navigate');
    // spy.and.returnValue(Promise.resolve(true));

    // const alert = injector.inject(AlertService) as AlertService;
    // const alertSpy = spyOn(alert, 'addAlert');
    // alertSpy.and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      // spy,
      // alertSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the title', async () => {
    const { getByText } = await setup();
    expect(getByText(`Change when you get 'expires soon' alerts`)).toBeTruthy();
  });
});
