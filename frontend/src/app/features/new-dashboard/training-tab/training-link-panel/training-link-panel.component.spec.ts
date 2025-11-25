import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { NewTrainingLinkPanelComponent } from './training-link-panel.component';

describe('NewTrainingLinkPanelComponent', () => {
  async function setup(totalRecords = 6, canEditEstablishment = true, isParent = false) {
    const { fixture, getByText, queryByText } = await render(NewTrainingLinkPanelComponent, {
      imports: [RouterModule],
      providers: [
        {
          provide: WorkerService,
          useClass: MockWorkerService,
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
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      componentProperties: {
        workplace: {
          uid: 'testuid123',
          isParent,
        } as Establishment,
        workers: [
          {
            trainingCount: 1,
          },
        ] as Worker[],
        totalRecords,
        canEditEstablishment,
      },
    });

    const component = fixture.componentInstance;
    const reportService = TestBed.inject(ReportService);

    const saveFileSpy = spyOn(component, 'saveFile').and.returnValue(null);

    return { component, fixture, getByText, queryByText, saveFileSpy, reportService };
  }

  it('should render a TrainingLinkPanelComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the `Add and manage mandatory training categories` link when canEditEstablishment in permissions service is true', async () => {
    const { getByText } = await setup();

    expect(getByText('Add and manage mandatory training categories')).toBeTruthy();
  });

  it('should not show the `Add and manage mandatory training categories` link when user does not have edit access', async () => {
    const { queryByText } = await setup(6, false);

    expect(queryByText('Add and manage mandatory training categories')).toBeFalsy();
  });

  it('should show the `Manage expiry alerts` link when canEditEstablishment in permissions service is true', async () => {
    const { getByText } = await setup();

    expect(getByText('Manage expiry alerts')).toBeTruthy();
  });

  it('should not show the `Manage expiry alerts` link when canEditEstablishment in permissions service is false', async () => {
    const { queryByText } = await setup(6, false);

    expect(queryByText(`Manage expiry alerts' alerts`)).toBeFalsy();
  });

  describe('training and quals report', () => {
    it('should not show the download link if the establishment has no training and qualification records', async () => {
      const { queryByText } = await setup(0);

      expect(queryByText('Download training report')).toBeFalsy();
    });

    it('should call getTrainingAndQualificationsReport with establishment uid when Download training report is clicked', async () => {
      const { component, getByText, saveFileSpy, reportService } = await setup();

      const reportServiceSpy = spyOn(reportService, 'getTrainingAndQualificationsReport').and.returnValue(of(null));

      const downloadTrainingButton = getByText('Download training report');

      downloadTrainingButton.click();

      expect(reportServiceSpy).toHaveBeenCalledWith(component.establishmentUid);
      expect(saveFileSpy).toHaveBeenCalled();
    });
  });

  describe('Parent training and quals report', () => {
    it('should be visible when workplace is parent', async () => {
      const { getByText } = await setup(6, true, true);

      const downloadTrainingButton = getByText('Download parent training report');
      expect(downloadTrainingButton).toBeTruthy();
    });

    it('should not be visible when workplace is not a parent', async () => {
      const { queryByText } = await setup(6, true, false);

      const downloadTrainingButton = queryByText('Download parent training report');
      expect(downloadTrainingButton).toBeFalsy();
    });

    it('should call getParentTrainingAndQualificationsReport with establishment uid when Download training report is clicked', async () => {
      const { component, getByText, saveFileSpy, reportService } = await setup(6, true, true);

      const reportServiceSpy = spyOn(reportService, 'getParentTrainingAndQualificationsReport').and.returnValue(
        of(null),
      );

      const downloadTrainingButton = getByText('Download parent training report');
      downloadTrainingButton.click();

      expect(reportServiceSpy).toHaveBeenCalledWith(component.establishmentUid);
      expect(saveFileSpy).toHaveBeenCalled();
    });
  });
});
