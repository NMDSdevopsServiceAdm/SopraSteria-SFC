//do-you-have-starters-vacancies-leavers

import { Directive, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { jobOptionsEnum } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Question } from '@features/workplace/question/question.component';

@Directive({})
export class DoYouHaveStartersLeaversVacanciesDirective extends Question implements OnInit {
  public section = 'Vacancies and turnover';
  public heading: string;
  public hintText: string;
  public revealText: string;
  public dataToPrefill: any;
  public hasStartersLeaversVacancies: boolean;
  public knownOptions = [
    {
      label: 'Yes',
      value: jobOptionsEnum.YES,
    },
    {
      label: 'No',
      value: jobOptionsEnum.NONE,
    },
    {
      label: 'I do not know',
      value: jobOptionsEnum.DONT_KNOW,
    },
  ];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private route: ActivatedRoute,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  protected init(): void {
    this.setupTextAndHeadings();
    this.setupRoutes();
    this.setupForm();
    this.prefillForm();
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      startersLeaversVacanciesKnown: null,
    });
  }

  protected setupRoutes(): void {}

  protected setupTextAndHeadings(): void {}

  protected getDataToPrefill(): void {}

  protected prefillForm(): void {
    this.getDataToPrefill();

    if (
      (typeof this.dataToPrefill === 'object' && this.dataToPrefill?.length > 0) ||
      this.hasStartersLeaversVacancies
    ) {
      this.form.setValue({
        startersLeaversVacanciesKnown: jobOptionsEnum.YES,
      });
    } else if (this.dataToPrefill === jobOptionsEnum.NONE || this.dataToPrefill === jobOptionsEnum.DONT_KNOW) {
      this.form.setValue({
        startersLeaversVacanciesKnown: this.dataToPrefill,
      });
    }
  }
}
