import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';

@Component({
  selector: 'app-summary-section',
  templateUrl: './summary-section.component.html',
  styleUrls: ['./summary-section.component.scss'],
})
export class SummarySectionComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() workerCount: number;
  @Input() navigateToTab: (event: Event, selectedTab: string) => void;
  public redFlag: boolean;

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
    const { showAddWorkplaceDetailsBanner, numberOfStaff, vacancies, starters, leavers } = this.workplace;

    this.redFlag = false;
    if (showAddWorkplaceDetailsBanner) {
      this.sections[0].message = 'Add more details to your workplace';
    } else if (this.establishmentService.checkCQCDetailsBanner) {
      this.sections[0].message = 'You need to check your CQC details';
    } else if (!numberOfStaff) {
      this.sections[0].message = `You've not added your total number of staff`;
      this.redFlag = true;
    } else if (numberOfStaff !== this.workerCount && this.afterEightWeeksFromFirstLogin()) {
      this.sections[0].message = 'Staff total does not match staff records added';
    } else if (!(!!vacancies?.length || !!starters?.length || !!leavers?.length)) {
      this.sections[0].message = `You've not added any vacancy and turnover data`;
    } else if (!vacancies && (leavers || starters)) {
      this.sections[0].message = `You've not added any staff vacancy data`;
    }
  }

  private afterEightWeeksFromFirstLogin(): boolean {
    return new Date(this.workplace.eightWeeksFromFirstLogin) < new Date();
  }

  public getStaffSummaryMessage(): void {
    if (!this.workerCount) {
      this.sections[1].message = 'You can start to add your staff records now';
    } else if (this.workplace.numberOfStaff !== this.workerCount && this.afterEightWeeksFromFirstLogin()) {
      this.sections[1].message = 'Staff records added does not match staff total';
    }
  }
}
