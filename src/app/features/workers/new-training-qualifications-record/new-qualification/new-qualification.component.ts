import { Component, Input, OnInit } from '@angular/core';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';

// import { Router } from '@angular/router';
// import { DialogService } from '@core/services/dialog.service';
// import {
//     DeleteQualificationDialogComponent,
// } from '@features/workers/delete-qualification-dialog/delete-qualification-dialog.component';
// import * as moment from 'moment';
// import { take } from 'rxjs/operators';

@Component({
  selector: 'app-new-qualification',
  templateUrl: './new-qualification.component.html',
})
export class NewQualificationsComponent implements OnInit {
  //   @Input() workplace: Establishment;
  //   public canEditWorker: boolean;
  @Input() qualificationsByType: any;

  //   @Output() qualificationsChanged: EventEmitter<boolean> = new EventEmitter();
  //   public lastUpdated: moment.Moment;
  //   public qualificationDetails = [];
  //   public qualificationDetailsLabel = [];

  constructor(
    private workerService: WorkerService,
    private permissionsService: PermissionsService, // private dialogService: DialogService, // private router: Router,
  ) {}

  ngOnInit() {
    // this.fetchAllRecords();
    console.log('hi');
    console.log(this.qualificationsByType);
  }

  //   deleteQualification(record, event) {
  //     event.preventDefault();
  //     const dialog = this.dialogService.open(DeleteQualificationDialogComponent, {
  //       nameOrId: this.worker.nameOrId,
  //       record,
  //     });
  //     dialog.afterClosed.pipe(take(1)).subscribe((confirm) => {
  //       if (confirm) {
  //         this.workerService.deleteQualification(this.workplace.uid, this.worker.uid, record.uid).subscribe(() => {
  //           this.workerService.alert = { type: 'success', message: 'Qualification has been deleted.' };
  //           this.fetchAllRecords();
  //           this.qualificationsChanged.emit(true);
  //         });
  //       }
  //     });
  //   }

  //   fetchAllRecords() {
  //     this.workerService.getQualifications(this.workplace.uid, this.worker.uid).subscribe((data) => {
  //       this.lastUpdated = moment(data.lastUpdated);
  //       this.qualifications = data.qualifications;
  //     });
  //   }

  /**
   * Function used to hadle toggle for traing details view and change training details lable

   */
  //   public toggleDetails(uid: string, event) {
  //     event.preventDefault();
  //     this.qualificationDetails[uid] = !this.qualificationDetails[uid];
  //     this.qualificationDetailsLabel[uid] = this.qualificationDetailsLabel[uid] === 'Close' ? 'Open' : 'Close';
  //   }
  //   public getRoute() {
  //     this.workerService.getRoute$.next(this.router.url);
  //   }
}
