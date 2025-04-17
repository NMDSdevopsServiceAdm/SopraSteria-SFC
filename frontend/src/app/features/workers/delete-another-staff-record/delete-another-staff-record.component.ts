import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import {
  DoYouWantToAddOrDeleteAnswer,
  VacanciesAndTurnoverService,
} from '@core/services/vacancies-and-turnover.service';

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
    private vacanciesAndTurnoverService: VacanciesAndTurnoverService,
  ) {
    this.form = this.formBuilder.group({
      deleteAnotherStaffRecord: null,
    });
  }
  ngOnInit(): void {
    this.workplaceUid = this.establishmentService.establishment.uid;
    this.prefillRadioIfUserHasComeBackToPage();
  }

  private prefillRadioIfUserHasComeBackToPage(): void {
    const previousAnswer = this.vacanciesAndTurnoverService.doYouWantToAddOrDeleteAnswer;

    if (previousAnswer) {
      this.form.get('deleteAnotherStaffRecord').setValue(previousAnswer);
    }
  }

  public onSubmit(): void {
    if (this.form.controls['deleteAnotherStaffRecord'].value === DoYouWantToAddOrDeleteAnswer.YES) {
      this.vacanciesAndTurnoverService.doYouWantToAddOrDeleteAnswer = DoYouWantToAddOrDeleteAnswer.YES;
      this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
    } else {
      this.vacanciesAndTurnoverService.resetVisitedAndSubmittedPages();
      this.vacanciesAndTurnoverService.doYouWantToAddOrDeleteAnswer = DoYouWantToAddOrDeleteAnswer.NO;

      this.router.navigate([
        '/workplace',
        this.workplaceUid,
        'staff-record',
        'update-workplace-details-after-deleting-staff',
      ]);
    }
  }
}
