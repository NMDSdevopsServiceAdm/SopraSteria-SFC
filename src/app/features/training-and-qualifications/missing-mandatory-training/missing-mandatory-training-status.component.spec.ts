import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionType } from '@core/model/permissions.model';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingService } from '@core/services/training.service';
import { UserService } from '@core/services/user.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { MissingMandatoryTrainingStatusComponent } from './missing-mandatory-training-status.component';

fdescribe('MissingMandatoryTrainingStatusComponent', () => {
  async function setup(addPermissions = true) {
    const permissions = addPermissions ? ['canEditWorker'] : [];
    const { fixture, getByText, getByTestId } = await render(MissingMandatoryTrainingStatusComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        BackLinkService,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: TrainingService,
          useClass: MockTrainingService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions as PermissionType[]),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                establishmentuid: '1234-5678',
              },
            },
          },
        },
      ],
    });
    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const trainingService = injector.inject(TrainingService) as TrainingService;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      routerSpy,
      trainingService,
    };
  }
  it('should render a MissingMandatoryTrainingStatusComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the fuction with correct data', async () => {
    const { trainingService } = await setup();
    const missingMandatoryTraining = spyOn(trainingService, 'getMissingMandatoryTraining').and.returnValue(
      of({
        missingTrainings: [
          {
            missing: 1,
            id: 2,
            category: 'Autism',
            workerName: 'Matt1',
            workerId: 11602,
            uid: 'e6e82050-1654-48cb-8ffc-c5e1c88bd016',
          },
          {
            missing: 1,
            id: 2,
            category: 'Autism',
            workerName: 'New staff',
            workerId: 11603,
            uid: '52790ce4-2a62-4e5d-8333-a146c603db14',
          },
        ],
      }),
    );

    expect(missingMandatoryTraining).toBeTruthy();
  });

  it('should render the correct table with heading', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('userTable')).toBeTruthy();
    expect(getByTestId('userTable-Heading')).toBeTruthy();
  });

  it('should navigate back to the dashboard when clicking the return to home button in a parent or stand alone account', async () => {
    const { getByText, component, fixture, routerSpy } = await setup();
    component.workplace.uid = '1234-5678';
    const button = getByText('Return to home');
    fireEvent.click(button);
    fixture.detectChanges();
    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
  });
  it('should navigate back to the workplace page when clicking the return to home button when accessing a sub account from a parent', async () => {
    const { getByText, fixture, routerSpy } = await setup();
    const button = getByText('Return to home');
    fireEvent.click(button);
    fixture.detectChanges();
    expect(routerSpy).toHaveBeenCalledWith(['/workplace', '1234-5678'], { fragment: 'training-and-qualifications' });
  });
});
