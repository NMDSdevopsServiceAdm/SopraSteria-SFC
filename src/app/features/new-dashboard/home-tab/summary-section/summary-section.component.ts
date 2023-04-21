import { Component, Input, OnInit } from '@angular/core';

import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import dayjs from 'dayjs';
import { Worker } from '@core/model/worker.model';

@Component({
  selector: 'app-summary-section',
  templateUrl: './summary-section.component.html',
  styleUrls: ['./summary-section.component.scss'],
})
export class SummarySectionComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() workerCount: number;
  @Input() workers: Worker[];

  @Input() navigateToTab: (event: Event, selectedTab: string) => void;
  public redFlag: boolean;

  public now = dayjs(new Date());

  public sections = [
    { linkText: 'Workplace', fragment: 'workplace', message: '' },
    { linkText: 'Staff records', fragment: 'staff-records', message: '' },
    { linkText: 'Training and qualifications', fragment: 'training-and-qualifications', message: '' },
  ];

  constructor(private tabsService: TabsService, private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.getWorkplaceSummaryMessage();
    this.getStaffSummaryMessage();
  }

  public getWorkplaceSummaryMessage(): void {
    this.redFlag = false;
    if (this.workplace.showAddWorkplaceDetailsBanner) {
      this.sections[0].message = 'Add more details to your workplace';
    } else if (this.establishmentService.checkCQCDetailsBanner) {
      this.sections[0].message = 'You need to check your CQC details';
    } else if (!this.workplace.numberOfStaff) {
      this.sections[0].message = `You've not added your total number of staff`;
      this.redFlag = true;
    } else if (this.workplace.numberOfStaff !== this.workerCount && this.afterEightWeeksFromFirstLogin()) {
      this.sections[0].message = 'Staff total does not match staff records added';
    }
  }

  private afterEightWeeksFromFirstLogin(): boolean {
    return new Date(this.workplace.eightWeeksFromFirstLogin) < new Date();
  }

  public getStaffSummaryMessage(): void {
    const afterWorkplaceCreated = dayjs(this.workplace.created).add(12, 'M');

    if (!this.workerCount) {
      this.sections[1].message = 'You can start to add your staff records now';
    } else if (this.workplace.numberOfStaff !== this.workerCount && this.afterEightWeeksFromFirstLogin()) {
      this.sections[1].message = 'Staff records added does not match staff total';
    } else if (
      this.now >= afterWorkplaceCreated &&
      this.workplace.numberOfStaff >= 2 &&
      this.now >= this.getWorkerUpdatedDate()
    ) {
      this.sections[1].message = 'No staff records added in the last 12 months';
    }
  }

  getWorkerUpdatedDate() {
    const workerCreatedDate = this.workers.map((worker: any) => new Date(worker.created).getTime());
    const getLatestWorkerUpdatedDate = new Date(Math.max(...workerCreatedDate));
    const afterWorkerCreated = dayjs(getLatestWorkerUpdatedDate).add(12, 'M');

    return afterWorkerCreated;
  }
}
