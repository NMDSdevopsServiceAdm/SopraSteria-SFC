import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

import { AddTotalStaffComponent } from './add-total-staff.component';

describe('AddTotalStaffComponent', () => {
  async function setup() {
    const component = await render(AddTotalStaffComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, RegistrationModule],
      providers: [
        BackService,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },

        {
          provide: WorkplaceService,
          useClass: MockWorkplaceService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: 'add-workplace',
                  },
                ],
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      spy,
    };
  }

  it('should render a AddTotalStaffComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the correct heading when in the registration journey', async () => {
    const { component } = await setup();
    component.fixture.componentInstance.isParent = true;
    component.fixture.detectChanges();

    const registrationHeading = component.queryByText(`How many members of staff does the workplace have?`);

    expect(registrationHeading).toBeTruthy();
  });

  it(`should display the paragraph`, async () => {
    const { component } = await setup();

    const paragraph = component.getByTestId('info');
    expect(paragraph).toBeTruthy();
  });

  it(`should display the reveal and its contents`, async () => {
    const { component } = await setup();
    component.fixture.componentInstance.isParent = true;
    component.fixture.detectChanges();

    const reveal = component.fixture.componentInstance.appDetailTitle;
    const revealContent = component.getByText(
      'You can enter an estimate to save time, but remember to update this number in ASC-WDS once your account has been validated by Skills for Care.',
      { exact: false },
    );

    expect(reveal).toBeTruthy();
    expect(revealContent).toBeTruthy();
  });

  it('should prefill the form if totalStaff is already set in the service', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.workplaceService.totalStaff$ = new BehaviorSubject('12');
    component.fixture.componentInstance.ngOnInit();

    const form = component.fixture.componentInstance.form;
    expect(form.value.totalStaff).toEqual('12');
    expect(form.valid).toBeTruthy();
  });

  it('should navigate to confirm-workplace-details url when continue button is clicked and total staff is given', async () => {
    const { component, spy } = await setup();

    (component.fixture.componentInstance as any).navigateToNextPage();
    component.fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(['add-workplace', 'confirm-workplace-details']);
  });

  describe('setBackLink()', () => {
    it('should set the correct back link', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      (component.fixture.componentInstance as any).setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['add-workplace', 'select-main-service'],
      });
    });
  });
});
