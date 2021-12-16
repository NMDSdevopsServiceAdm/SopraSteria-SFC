import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AlertService } from '@core/services/alert.service';
import { DialogService } from '@core/services/dialog.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

@Component({
  selector: 'app-parent-request-individual',
  templateUrl: './parent-request-individual.component.html',
})
export class ParentRequestIndividualComponent implements OnInit {
  @Output() removeParentRequest: EventEmitter<any> = new EventEmitter<any>();
  @Input() index: number;
  @Input() parentRequest: any;
  public parentRequestForm: FormGroup;
  public approve: boolean;
  public rejectionReason: string;

  constructor(
    public parentRequestsService: ParentRequestsService,
    public switchWorkplaceService: SwitchWorkplaceService,
    public dialogService: DialogService,
    public alertService: AlertService,
  ) {}
  ngOnInit() {
    this.parentRequestForm = new FormGroup({});
  }
}
