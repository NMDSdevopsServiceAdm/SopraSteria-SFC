import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Note } from '@core/model/registrations.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { Dialog, DialogService } from '@core/services/dialog.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import {
  ApprovalOrRejectionDialogComponent,
} from '@features/admin/components/approval-or-rejection-dialog/approval-or-rejection-dialog.component';

@Component({
  selector: 'app-cqc-individual-main-service-change',
  templateUrl: './cqc-individual-main-service-change.component.html',
})
export class CqcIndividualMainServiceChangeComponent implements OnInit {
  public registration;
  public loggedInUser;
  public notes: Note[];
  public notesForm: FormGroup;
  public notesError: string;

  constructor(
    public registrationsService: RegistrationsService,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private alertService: AlertService,
    public formBuilder: FormBuilder,
    public switchWorkplaceService: SwitchWorkplaceService,
    public breadcrumbService: BreadcrumbService,
    public cqcStatusChangeService: CqcStatusChangeService,
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.route.snapshot.data.loggedInUser;
    this.registration = this.route.snapshot.data.approval;
    // this.notes = this.route.snapshot.data.notes;
    console.log(this.notes);
    this.setBreadcrumbs();
    this.setupNotesForm();
  }

  public setBreadcrumbs(): void {}

  public approveOrRejectCqcChange(isApproval: boolean): void {
    const dialog = this.openApprovalOrRejectionDialog(isApproval);

    dialog.afterClosed.subscribe((confirmed) => {
      if (confirmed) {
        console.log('confirmed');
        this.showApprovalOrRejectionConfirmationAlert(isApproval);
      }
    });
  }

  private openApprovalOrRejectionDialog(isApproval: boolean): Dialog<ApprovalOrRejectionDialogComponent> {
    return this.dialogService.open(ApprovalOrRejectionDialogComponent, {
      workplaceName: 'Stub Workplace',
      approvalName: 'CQC main service change',
      approvalType: 'change',
      isApproval,
    });
  }

  private showApprovalOrRejectionConfirmationAlert(isApproval: boolean): void {
    this.alertService.addAlert({
      type: 'success',
      message: `The main service change of workplace 'Stub Workplace' has been ${isApproval ? 'approved' : 'rejected'}`,
    });
  }

  private setupNotesForm(): void {
    this.notesForm = this.formBuilder.group({
      notes: ['', { validators: [Validators.required], updateOn: 'submit' }],
    });
  }

  public addNote(): void {
    if (this.notesForm.valid) {
      const body = {
        note: this.notesForm.get('notes').value,
        establishmentId: this.registration.establishment.establishmentId,
        noteType: 'Main Service',
        userUid: this.loggedInUser.uid,
      };

      this.registrationsService.addRegistrationNote(body).subscribe(
        () => {
          this.getNotes();
          this.notesForm.reset();
        },
        (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.notesError = 'There was an error adding the note to the registration';
          } else {
            this.notesError = 'There was a server error';
          }
        },
      );
    }
  }

  public getNotes(): void {
    this.registrationsService.getRegistrationNotes(this.registration.establishment.establishmentUid).subscribe(
      (data) => {
        this.notes = data;
      },
      () => {
        this.notesError = 'There was an error retrieving the notes';
      },
    );
  }
}
