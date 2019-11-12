import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Establishment, SortStaffOptions } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { DataTableDirective } from 'angular-datatables';
import * as moment from 'moment';

@Component({
  selector: 'app-staff-summary',
  templateUrl: './staff-summary.component.html',
})
export class StaffSummaryComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  @Input() workplace: Establishment;
  @Input() workers: Array<Worker>;
  @Input() wdfView = false;

  public canViewWorker: boolean;
  public canEditWorker: boolean;
  public dtOptions: DataTables.Settings = {};
  public sortStaffOptions;
  public defaultSelectedColumn;

  constructor(private permissionsService: PermissionsService) {}

  public lastUpdated(timestamp: string): string {
    const lastUpdated: moment.Moment = moment(timestamp);
    const isToday: boolean = moment().isSame(lastUpdated, 'day');
    return isToday ? 'Today' : lastUpdated.format('D MMMM YYYY');
  }

  public getWorkerRecordPath(worker: Worker) {
    const path = ['/workplace', this.workplace.uid, 'staff-record', worker.uid];
    return this.wdfView ? [...path, ...['wdf-summary']] : path;
  }

  ngOnInit() {
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.sortStaffOptions = SortStaffOptions;
    this.dtOptions = this.buildDtOptions();
    this.defaultSelectedColumn = '0_asc';
  }

  private buildDtOptions(): DataTables.Settings {
    return {
      paging: false,
      ordering: true,
      searching: false,
      info: false,
      //To make orderable false for all columns because we are using dropdown for sorting
      columnDefs: [{ orderable: false, targets: [0, 1, 2, 3] }],
    };
  }

  public sortByColumn(selectedColumn: any) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      switch (selectedColumn) {
        case '0_asc': {
          dtInstance.order([0, 'asc']).draw();
          break;
        }
        case '0_dsc': {
          dtInstance.order([0, 'dsc']).draw();
          break;
        }
        case '1_asc': {
          dtInstance.order([1, 'asc']).draw();
          break;
        }
        case '1_dsc': {
          dtInstance.order([1, 'dsc']).draw();
          break;
        }
        default: {
          dtInstance.order([0, 'asc']).draw();
          break;
        }
      }
    });
  }
}
