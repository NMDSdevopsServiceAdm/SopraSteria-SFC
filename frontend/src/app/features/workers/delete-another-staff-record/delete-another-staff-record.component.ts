import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { UpdateWorkplaceAfterStaffChangesService } from '@core/services/update-workplace-after-staff-changes.service';

@Component({
  selector: 'app-delete-add-another-staff-record',
  templateUrl: './delete-another-staff-record.component.html',
})
export class DeleteAnotherStaffRecordComponent implements OnInit {
  public form: UntypedFormGroup;
  private workplaceUid: string;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private establishmentService: EstablishmentService,
    private updateWorkplaceAfterStaffChangesService: UpdateWorkplaceAfterStaffChangesService,
  ) {
    this.form = this.formBuilder.group({
      deleteAnotherStaffRecord: null,
    });
  }
  ngOnInit(): void {
    this.workplaceUid = this.establishmentService.establishment.uid;
  }

  public onSubmit(): void {
    if (this.form.controls['deleteAnotherStaffRecord'].value === 'YES') {
      this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
    } else {
      this.updateWorkplaceAfterStaffChangesService.resetVisitedAndSubmittedPages();
      this.router.navigate([
        '/workplace',
        this.workplaceUid,
        'staff-record',
        'update-workplace-details-after-deleting-staff',
      ]);
    }
  }
}
