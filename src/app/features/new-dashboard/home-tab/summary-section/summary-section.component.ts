import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
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
  @Input() trainingCounts: TrainingCounts;
  @Input() navigateToTab: (event: Event, selectedTab: string) => void;

  public sections = [
    { linkText: 'Workplace', fragment: 'workplace', message: '', route: undefined, redFlag: false },
    { linkText: 'Staff records', fragment: 'staff-records', message: '', route: undefined, redFlag: false },
    {
      linkText: 'Training and qualifications',
      fragment: 'training-and-qualifications',
      message: '',
      route: undefined,
      redFlag: false,
    },
  ];

  constructor(
    private tabsService: TabsService,
    private establishmentService: EstablishmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getWorkplaceSummaryMessage();
    this.getStaffSummaryMessage();
    this.getTrainingAndQualsSummary();
  }

  public onClick(event: Event, fragment: string, route: string[]): void {
    event.preventDefault();
    if (route) {
      this.tabsService.selectedTab = fragment;
      this.router.navigate(route);
    } else {
      this.navigateToTab(event, fragment);
    }
  }

  public getWorkplaceSummaryMessage(): void {
    const { showAddWorkplaceDetailsBanner, numberOfStaff, vacancies, starters, leavers } = this.workplace;

    this.sections[0].redFlag = false;
    if (showAddWorkplaceDetailsBanner) {
      this.sections[0].message = 'Add more details to your workplace';
    } else if (this.establishmentService.checkCQCDetailsBanner) {
      this.sections[0].message = 'You need to check your CQC details';
    } else if (!numberOfStaff) {
      this.sections[0].message = `You've not added your total number of staff`;
      this.sections[0].redFlag = true;
    } else if (numberOfStaff !== this.workerCount && this.afterEightWeeksFromFirstLogin()) {
      this.sections[0].message = 'Staff total does not match staff records added';
    } else if (!(!!vacancies?.length || !!starters?.length || !!leavers?.length)) {
      this.sections[0].message = `You've not added any vacancy and turnover data`;
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

  public getTrainingAndQualsSummary(): void {
    if (this.trainingCounts.missingMandatoryTraining) {
      this.sections[2].redFlag = true;
      this.sections[2].message = `${this.trainingCounts.missingMandatoryTraining} staff ${
        this.trainingCounts.missingMandatoryTraining > 1 ? 'are' : 'is'
      } missing mandatory training`;
      this.sections[2].route = [
        '/workplace',
        this.workplace.uid,
        'training-and-qualifications',
        'missing-mandatory-training',
      ];
    }
  }
}
