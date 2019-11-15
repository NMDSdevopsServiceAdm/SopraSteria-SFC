import { Component, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public canViewEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public lastLoggedIn: string;
  public totalStaffRecords: number;
  public workplace: Establishment;
  public trainingAlert: number;
  public temp = [
    {
      uid: '59b6b514-89e0-4248-a62a-bbe721aab8ef',
      localIdentifier: 'Fred',
      nameOrId: 'Fred',
      contract: 'Permanent',
      mainJob: {
        jobId: 29,
        title: 'Technician ',
      },
      completed: false,
      created: '2019-09-03T09:04:05.873Z',
      updated: '2019-10-24T05:47:09.703Z',
      updatedBy: 'uname70',
      effectiveFrom: '2019-04-01T00:00:00.000Z',
      wdfEligible: false,
      trainingCount: 2,
      expiredTrainingCount: 2,
      expiringTrainingCount: 0,
      qualificationCount: 1,
    },
    {
      uid: '123bcc1f-4484-4720-ab62-4c5f336ffda5',
      localIdentifier: 'Pete',
      nameOrId: 'Pete',
      contract: 'Permanent',
      mainJob: {
        jobId: 10,
        title: 'Care Worker',
      },
      completed: false,
      created: '2019-10-30T06:15:39.896Z',
      updated: '2019-10-30T06:24:55.118Z',
      updatedBy: 'uname70',
      effectiveFrom: '2019-04-01T00:00:00.000Z',
      wdfEligible: false,
      trainingCount: 1,
      expiredTrainingCount: 0,
      expiringTrainingCount: 1,
      qualificationCount: 1,
    },
    {
      uid: 'f9e6d60e-f6e4-4079-a5b9-8fa2e55f5c5a',
      localIdentifier: 'PS12',
      nameOrId: 'PS1 Worker2',
      contract: 'Permanent',
      mainJob: {
        jobId: 28,
        title: 'Supervisor',
      },
      completed: true,
      created: '2019-08-27T07:15:48.385Z',
      updated: '2019-09-02T08:07:00.350Z',
      updatedBy: 'uname70',
      effectiveFrom: '2019-04-01T00:00:00.000Z',
      wdfEligible: true,
      wdfEligibilityLastUpdated: '2019-08-27T07:22:23.179Z',
      trainingCount: 1,
      expiredTrainingCount: 0,
      expiringTrainingCount: 1,
      qualificationCount: 3,
    },
    {
      uid: 'cc8d6e24-4c8e-46c6-941a-34326c1c8539',
      localIdentifier: 'Bill',
      nameOrId: 'Bill',
      contract: 'Permanent',
      mainJob: {
        jobId: 9,
        title: 'Care Navigator',
      },
      completed: false,
      created: '2019-09-04T03:57:51.540Z',
      updated: '2019-09-09T06:47:05.833Z',
      updatedBy: 'uname70',
      effectiveFrom: '2019-04-01T00:00:00.000Z',
      wdfEligible: false,
      trainingCount: 0,
      expiredTrainingCount: 0,
      expiringTrainingCount: 0,
      qualificationCount: 0,
    },
    {
      uid: 'dcffda68-3656-40a2-9094-9cb68f851f87',
      localIdentifier: 'PS11',
      nameOrId: 'PS1 Worker1',
      contract: 'Temporary',
      mainJob: {
        jobId: 10,
        title: 'Care Worker',
      },
      completed: true,
      created: '2019-08-27T07:15:48.089Z',
      updated: '2019-09-02T07:12:48.580Z',
      updatedBy: 'uname70',
      effectiveFrom: '2019-04-01T00:00:00.000Z',
      wdfEligible: true,
      wdfEligibilityLastUpdated: '2019-08-27T07:22:23.357Z',
      trainingCount: 0,
      expiredTrainingCount: 0,
      expiringTrainingCount: 0,
      qualificationCount: 3,
    },
    {
      uid: 'b72987c0-499a-436b-a44b-0a4107738b81',
      localIdentifier: 'PS10',
      nameOrId: 'Ann',
      contract: 'Permanent',
      mainJob: {
        jobId: 9,
        title: 'Care Navigator',
      },
      completed: true,
      created: '2019-08-21T04:14:21.989Z',
      updated: '2019-08-30T07:48:27.537Z',
      updatedBy: 'admin1',
      effectiveFrom: '2019-04-01T00:00:00.000Z',
      wdfEligible: true,
      wdfEligibilityLastUpdated: '2019-08-27T07:15:47.939Z',
      trainingCount: 0,
      expiredTrainingCount: 0,
      expiringTrainingCount: 0,
      qualificationCount: 3,
    },
    {
      uid: '8627bcea-b7d9-4332-8671-882fa2421a23',
      localIdentifier: 'PS13',
      nameOrId: 'PS1 Worker3',
      contract: 'Permanent',
      mainJob: {
        jobId: 18,
        title: 'Occupational Therapist',
      },
      completed: true,
      created: '2019-08-27T07:15:48.240Z',
      updated: '2019-08-27T08:05:53.408Z',
      updatedBy: 'uname70',
      effectiveFrom: '2019-04-01T00:00:00.000Z',
      wdfEligible: true,
      wdfEligibilityLastUpdated: '2019-08-27T07:22:23.526Z',
      trainingCount: 0,
      expiredTrainingCount: 0,
      expiringTrainingCount: 0,
      qualificationCount: 3,
    },
  ];

  constructor(
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private userService: UserService,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.workplace = this.establishmentService.primaryWorkplace;
    const workplaceUid: string = this.workplace ? this.workplace.uid : null;
    this.canViewListOfUsers = this.permissionsService.can(workplaceUid, 'canViewListOfUsers');
    this.canViewListOfWorkers = this.permissionsService.can(workplaceUid, 'canViewListOfWorkers');
    this.canViewEstablishment = this.permissionsService.can(workplaceUid, 'canViewEstablishment');

    if (this.workplace) {
      this.subscriptions.add(
        this.workerService.getTotalStaffRecords(this.workplace.uid).subscribe(
          total => {
            if (total) {
              this.totalStaffRecords = total;
            }
          },
          error => {
            console.error(error.error);
          }
        )
      );
      this.subscriptions.add(
        this.workerService.getAllWorkers(this.workplace.uid).subscribe(
          workers => {
            this.workerService.setWorkers(workers);
            this.trainingAlert = this.getTrainingAlertFlag(workers);
          },
          error => {
            console.error(error.error);
          }
        )
      );
    }

    const lastLoggedIn = this.userService.loggedInUser.lastLoggedIn;
    this.lastLoggedIn = lastLoggedIn ? lastLoggedIn : null;

    this.userService.updateReturnUrl({
      url: ['/dashboard'],
      fragment: 'user-accounts',
    });
  }

  public getTrainingAlertFlag(workers) {
    let expariedTrainingCount = 0;
    let expiringTrainingCount = 0;
    if (workers) {
      expariedTrainingCount = workers.filter(worker => worker.expiredTrainingCount > 0).length;
      expiringTrainingCount = workers.filter(worker => worker.expiringTrainingCount > 0).length;
      if (expariedTrainingCount > 0) {
        return 2;
      } else if (expiringTrainingCount > 0) {
        return 1;
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
