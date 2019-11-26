import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Qualification } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { DialogService } from '@core/services/dialog.service';
import { Router } from '@angular/router';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { DeleteQualificationDialogComponent } from '@features/workers/delete-qualification-dialog/delete-qualification-dialog.component';
import * as moment from 'moment';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-qualifications',
  templateUrl: './qualifications.component.html',
})
export class QualificationsComponent implements OnInit {
  @Input() worker: Worker;
  @Input() workplace: Establishment;
  @Output() qualificationsChanged: EventEmitter<boolean> = new EventEmitter();
  public canEditWorker: boolean;
  public lastUpdated: moment.Moment;
  public qualifications: Qualification[];
  public qualificationDetails = [];
  public qualificationDetailsLabel = [];

  constructor(
    private workerService: WorkerService,
    private permissionsService: PermissionsService,
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.fetchAllRecords();

    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
  }

  deleteQualification(record, event) {
    event.preventDefault();
    const dialog = this.dialogService.open(DeleteQualificationDialogComponent, {
      nameOrId: this.worker.nameOrId,
      record,
    });
    dialog.afterClosed.pipe(take(1)).subscribe(confirm => {
      if (confirm) {
        this.workerService.deleteQualification(this.workplace.uid, this.worker.uid, record.uid).subscribe(() => {
          this.workerService.alert = { type: 'success', message: 'Qualification has been deleted.' };
          this.fetchAllRecords();
          this.qualificationsChanged.emit(true);
        });
      }
    });
  }

  fetchAllRecords() {
    this.workerService.getQualifications(this.workplace.uid, this.worker.uid).subscribe(data => {
      this.lastUpdated = moment(data.lastUpdated);
      this.qualifications = data.qualifications;
    });
  }

  /**
   * Function used to hadle toggle for traing details view and change training details lable
   * @param {number} index numer of clicked row
   * @param {event} refrance of event handler
   */
  public toggleDetails(index: number, event) {
    event.preventDefault();
    this.qualificationDetails[index] = !this.qualificationDetails[index];
    this.qualificationDetailsLabel[index] = this.qualificationDetailsLabel[index] === 'Close' ? 'Open' : 'Close';
  }
  public getRoute() {
    this.workerService.getRoute$.next(this.router.url);
  }
}
