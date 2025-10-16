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
import { TrainingLinkPanelComponent } from '@shared/components/training-link-panel/training-link-panel.component';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { Establishment as MockEstablishment } from '../../../../mockdata/establishment';

describe('TrainingLinkPanelComponent', () => {
  async function setup(totalRecords = 6) {
    const { fixture, getByText, queryByText } = await render(TrainingLinkPanelComponent, {
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
        tAndQsLastUpdated: new Date('2020-01-01').toISOString(),
      },
    });

    const component = fixture.componentInstance;

    return { component, fixture, getByText, queryByText };
  }

  it('should render a TrainingLinkPanelComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the total number of records', async () => {
    const { getByText } = await setup();

    expect(getByText('Training and qualifications (6)'));
  });

  it('should show the latest date of any training record (1/1/20)', async () => {
    const { getByText } = await setup();
    expect(getByText('Last update, 1 January 2020')).toBeTruthy();
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
