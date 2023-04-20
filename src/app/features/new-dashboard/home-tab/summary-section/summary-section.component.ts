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
    // return true;
    return new Date(this.workplace.eightWeeksFromFirstLogin) < new Date();
  }
}
