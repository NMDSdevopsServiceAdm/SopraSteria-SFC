import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { TrainingLinkPanelComponent } from '@shared/components/training-link-panel/training-link-panel.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { Establishment as MockEstablishment } from '../../../../mockdata/establishment';

describe('TrainingLinkPanelComponent', () => {
  async function setup() {
    const component = await render(TrainingLinkPanelComponent, {
      imports: [RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(0, Roles.Admin),
          deps: [HttpClient],
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditEstablishment']),
          deps: [HttpClient, Router, UserService],
        },
      ],
      componentProperties: {
        workplace: MockEstablishment as Establishment,
        workers: [
          {
            trainingCount: 1,
            trainingLastUpdated: new Date('2020-01-01').toISOString(),
          },
        ] as Worker[],
      },
    });

    const fixture = component.fixture;
    const componentInstance = fixture.componentInstance;
    return { component, fixture, componentInstance };
  }

  it('should render a TrainingLinkPanelComponent', async () => {
    const { component } = await setup();

    component.fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show the latest date of any training record (1/1/20)', async () => {
    const { component } = await setup();

    component.fixture.detectChanges();
    component.getByText('Updated 1 January 2020');
  });

  it('should show the Manage mandatory training link when canEditEstablishment in permissions service is true', async () => {
    const { component } = await setup();

    expect(component.getByText('Manage mandatory training')).toBeTruthy();
  });

  it('should not show the Manage mandatory training link when user does not have edit access', async () => {
    const { component, fixture, componentInstance } = await setup();

    componentInstance.canEditEstablishment = false;
    fixture.detectChanges();

    expect(component.queryByText('Manage mandatory training')).toBeFalsy();
  });

  it('should show the `change when you get expires soon alert` link when  canEditEstablishment in permissions service is true', async () => {
    const { component, fixture, componentInstance } = await setup();

    componentInstance.canEditEstablishment = true;
    fixture.detectChanges();

    expect(component.getByText("Change when you get 'expires soon' alerts")).toBeTruthy();
  });

  it('should not show the `change when you get expires soon alert` link when canEditEstablishment in permissions service is false', async () => {
    const { component, fixture, componentInstance } = await setup();

    componentInstance.canEditEstablishment = false;
    fixture.detectChanges();

    expect(component.queryByText("Change when you get 'expires soon' alerts")).toBeFalsy();
  });

  it('should call getTrainingAndQualificationsReport with establishment uid when Download training report is clicked', async () => {
    const { component, componentInstance, fixture } = await setup();

    const reportService = TestBed.inject(ReportService);
    const reportServiceSpy = spyOn(reportService, 'getTrainingAndQualificationsReport').and.returnValue(of(null));
    const saveFileSpy = spyOn(componentInstance, 'saveFile').and.returnValue(null);

    const downloadTrainingButton = component.getByText('Download training report');

    downloadTrainingButton.click();
    fixture.detectChanges();

    expect(reportServiceSpy).toHaveBeenCalledWith(componentInstance.establishmentUid);
    expect(saveFileSpy).toHaveBeenCalled();
  });

  describe('Parent training and quals report', () => {
    it('should call getParentTrainingAndQualificationsReport with establishment uid when Download training report is clicked', async () => {
      const { component, componentInstance, fixture } = await setup();

      const reportService = TestBed.inject(ReportService);
      const reportServiceSpy = spyOn(reportService, 'getParentTrainingAndQualificationsReport').and.returnValue(
        of(null),
      );
      const saveFileSpy = spyOn(componentInstance, 'saveFile').and.returnValue(null);

      componentInstance.isParent = true;
      fixture.detectChanges();

      const downloadTrainingButton = component.getByText('Download parent training report');
      downloadTrainingButton.click();
      fixture.detectChanges();

      expect(reportServiceSpy).toHaveBeenCalledWith(componentInstance.establishmentUid);
      expect(saveFileSpy).toHaveBeenCalled();
    });

    it('should only be visible for parents', async () => {
      const { component, componentInstance, fixture } = await setup();

      componentInstance.isParent = true;
      fixture.detectChanges();

      const downloadTrainingButton = component.getByText('Download parent training report');
      expect(downloadTrainingButton).toBeTruthy();
    });

    it('should not be visible for standalone workplaces', async () => {
      const { component, componentInstance, fixture } = await setup();

      componentInstance.isParent = false;
      fixture.detectChanges();

      const downloadTrainingButton = component.queryByText('Download parent training report');
      expect(downloadTrainingButton).toBeFalsy();
    });
  });
});
