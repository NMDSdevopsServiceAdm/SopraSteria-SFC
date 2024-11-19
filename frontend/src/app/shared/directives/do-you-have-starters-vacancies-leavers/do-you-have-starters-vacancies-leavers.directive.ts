//do-you-have-starters-vacancies-leavers

import { Directive, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Question } from '@features/workplace/question/question.component';

@Directive({})
export class DoYouHaveStartersVacanciesLeaversDirective extends Question implements OnInit {
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

  ngOnInit(): void {}
}
