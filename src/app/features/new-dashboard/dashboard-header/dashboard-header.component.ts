import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-new-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss'],
})
export class NewDashboardHeaderComponent implements OnInit {
  @Input() tab: string;
  @Input() canAddWorker = false;
  @Input() updatedDate: string;
  @Input() tAndQCount = 0;
  @Input() canEditWorker = false;
  @Input() hasWorkers = false;

  public workplace: Establishment;
  public showLastUpdatedDate: boolean;
  public tabsMap = {
    workplace: 'Workplace',
    'staff-records': 'Staff records',
    'training-and-qualifications': 'Training and qualifications',
    benchmarks: 'Benchmarks',
  };
  public header: string;

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.getHeader();
  }

  private getHeader(): void {
    if (this.tab === 'training-and-qualifications') {
      this.header = `${this.tabsMap[this.tab]} (${this.tAndQCount})`;
    } else {
      this.header = this.tabsMap[this.tab];
    }
  }
}
