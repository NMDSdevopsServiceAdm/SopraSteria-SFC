import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import {
  DoYouWantToAddOrDeleteAnswer,
  VacanciesAndTurnoverService,
} from '@core/services/vacancies-and-turnover.service';

@Component({
    selector: 'app-add-another-staff-record',
    templateUrl: './add-another-staff-record.component.html',
    standalone: false
})
export class AddAnotherStaffRecordComponent implements OnInit {
  public form: UntypedFormGroup;
  private workplaceUid: string;

  constructor(
    private backLinkService: BackLinkService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private establishmentService: EstablishmentService,
    private vacanciesAndTurnoverService: VacanciesAndTurnoverService,
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
    const previousAnswer = this.vacanciesAndTurnoverService.doYouWantToAddOrDeleteAnswer;

    if (previousAnswer) {
      this.form.get('addAnotherStaffRecord').setValue(previousAnswer);
    }
  }

  public onSubmit() {
    if (this.form.controls['addAnotherStaffRecord'].value === DoYouWantToAddOrDeleteAnswer.YES) {
      this.vacanciesAndTurnoverService.doYouWantToAddOrDeleteAnswer = DoYouWantToAddOrDeleteAnswer.YES;
      this.router.navigate(['/workplace', this.workplaceUid, 'staff-record', 'create-staff-record', 'staff-details']);
    } else {
      this.vacanciesAndTurnoverService.resetVisitedAndSubmittedPages();
      this.vacanciesAndTurnoverService.doYouWantToAddOrDeleteAnswer = DoYouWantToAddOrDeleteAnswer.NO;

      this.router.navigate([
        '/workplace',
        this.workplaceUid,
        'staff-record',
        'update-workplace-details-after-adding-staff',
      ]);
    }
  }
}
