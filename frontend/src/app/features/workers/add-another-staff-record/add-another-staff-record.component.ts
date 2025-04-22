import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import {
  DoYouWantToAddOrDeleteAnswer,
  UpdateWorkplaceAfterStaffChangesService,
} from '@core/services/update-workplace-after-staff-changes.service';

@Component({
  selector: 'app-add-another-staff-record',
  templateUrl: './add-another-staff-record.component.html',
})
export class AddAnotherStaffRecordComponent implements OnInit {
  public form: UntypedFormGroup;
  private workplaceUid: string;

  constructor(
    private backLinkService: BackLinkService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private establishmentService: EstablishmentService,
    private updateWorkplaceAfterStaffChangesService: UpdateWorkplaceAfterStaffChangesService,
  ) {
    this.form = this.formBuilder.group({
      addAnotherStaffRecord: null,
    });
  }
  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.workplaceUid = this.establishmentService.establishment.uid;
    this.prefillRadioIfUserHasComeBackToPage();
  }

  private prefillRadioIfUserHasComeBackToPage(): void {
    const previousAnswer = this.updateWorkplaceAfterStaffChangesService.doYouWantToAddOrDeleteAnswer;

    if (previousAnswer) {
      this.form.get('addAnotherStaffRecord').setValue(previousAnswer);
    }
  }

  public onSubmit() {
    if (this.form.controls['addAnotherStaffRecord'].value === DoYouWantToAddOrDeleteAnswer.YES) {
      this.updateWorkplaceAfterStaffChangesService.doYouWantToAddOrDeleteAnswer = DoYouWantToAddOrDeleteAnswer.YES;
      this.router.navigate(['/workplace', this.workplaceUid, 'staff-record', 'create-staff-record', 'staff-details']);
    } else {
      this.updateWorkplaceAfterStaffChangesService.resetVisitedAndSubmittedPages();
      this.updateWorkplaceAfterStaffChangesService.doYouWantToAddOrDeleteAnswer = DoYouWantToAddOrDeleteAnswer.NO;

      this.router.navigate([
        '/workplace',
        this.workplaceUid,
        'staff-record',
        'update-workplace-details-after-adding-staff',
      ]);
    }
  }
}
