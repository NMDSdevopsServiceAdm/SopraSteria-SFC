import { Component, OnInit } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-total-staff-panel',
  templateUrl: './total-staff-panel.component.html',
  styleUrls: ['./total-staff-panel.component.scss'],
})
export class TotalStaffPanelComponent implements OnInit {
  public total: { staff: number; workers: number } = null;
  private subscriptions: Subscription = new Subscription();

  constructor(private establishmentService: EstablishmentService, private workerService: WorkerService) {}

  ngOnInit() {
    const combined$ = combineLatest(this.establishmentService.getStaff(), this.workerService.getAllWorkers());
    this.subscriptions.add(
      combined$.pipe(map(results => ({ staff: results[0], workers: results[1].length }))).subscribe(total => {
        this.total = total;
      })
    );
  }
}
