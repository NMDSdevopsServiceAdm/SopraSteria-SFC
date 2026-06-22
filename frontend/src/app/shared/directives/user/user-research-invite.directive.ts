import { AfterViewInit, Directive, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Directive()
export class UserResearchInviteDirective implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    protected backLinkService: BackLinkService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}
}
