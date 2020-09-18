import { Component, OnInit } from '@angular/core';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';

@Component({
  selector: 'app-cqc-status-changes',
  templateUrl: './cqc-status-changes.component.html',
})
export class CqcStatusChangesComponent implements OnInit {
  public cqcStatusChanges = [];

  constructor(public cqcStatusChangeService: CqcStatusChangeService) {}

  ngOnInit() {
    this.getCqcStatusChanges();
  }

  public getCqcStatusChanges() {
    this.cqcStatusChangeService.getCqcStatusChanges().subscribe(
      (data) => {
        this.cqcStatusChanges = data;
      },
      (error) => this.onError(error),
    );
  }

  public removeCqcStatusChanges(index: number) {
    this.cqcStatusChanges.splice(index, 1);
  }

  private onError(error) {}
}
