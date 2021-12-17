import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CqcStatusChange } from '@core/model/cqc-status-change.model';
import { Note } from '@core/model/registrations.model';
import { AlertService } from '@core/services/alert.service';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { DialogService } from '@core/services/dialog.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

@Component({
  selector: 'app-parent-request-individual',
  templateUrl: './parent-request-individual.component.html',
})
export class ParentRequestIndividualComponent implements OnInit {
  public registration: CqcStatusChange;
  public loggedInUser;
  public userFullName: string;
  public notes: Note[];
  public notesForm: FormGroup;
  public notesError: string;
  public checkBoxError: string;
  public approvalOrRejectionServerError: string;

  constructor(
    public registrationsService: RegistrationsService,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private alertService: AlertService,
    public formBuilder: FormBuilder,
    public switchWorkplaceService: SwitchWorkplaceService,
    public cqcStatusChangeService: CqcStatusChangeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.route.snapshot.data.loggedInUser;
    this.registration = this.route.snapshot.data.approval;
    this.userFullName = this.loggedInUser.fullname;
    this.notes = this.route.snapshot.data.notes;
  }
}
