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
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { Establishment as MockEstablishment } from '../../../../../mockdata/establishment';
import { NewTrainingLinkPanelComponent } from './training-link-panel.component';

describe('NewTrainingLinkPanelComponent', () => {
  async function setup(totalRecords = 6, canEditEstablishment = true) {
    const { fixture, getByText, queryByText } = await render(NewTrainingLinkPanelComponent, {
      imports: [RouterModule, RouterTestingModule, HttpClientTestingModule],
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
      ],
      componentProperties: {
        workplace: MockEstablishment as Establishment,
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

    return { component, fixture, getByText, queryByText };
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
      const { component, fixture, getByText } = await setup();

      const reportService = TestBed.inject(ReportService);
      const reportServiceSpy = spyOn(reportService, 'getTrainingAndQualificationsReport').and.returnValue(of(null));
      const saveFileSpy = spyOn(component, 'saveFile').and.returnValue(null);

      const downloadTrainingButton = getByText('Download training report');

      downloadTrainingButton.click();
      fixture.detectChanges();

      expect(reportServiceSpy).toHaveBeenCalledWith(component.establishmentUid);
      expect(saveFileSpy).toHaveBeenCalled();
    });
  });
});
