import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportsService } from '@core/services/reports.service';

@Component({
  selector: 'app-edit-workplace',
  templateUrl: './edit-workplace.component.html',
})
export class EditWorkplaceComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
    private reportsService: ReportsService
  ) {}

  ngOnInit() {
    console.log(this.route.snapshot.data.worker);
    // this.establishmentService.sta
  }

  ngOnDestroy(): void {
    //this.reportsService.updateState(null);
  }
}
