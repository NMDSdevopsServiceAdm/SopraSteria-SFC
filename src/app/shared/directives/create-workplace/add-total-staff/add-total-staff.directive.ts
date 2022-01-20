import { Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';

@Directive()
export class AddTotalStaffDirective implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;

  public flow: string;
  protected serverErrorsMap: Array<ErrorDefinition>;
  public submitted = false;
  public form: FormGroup;
  public serverError: string;
  public returnToConfirmDetails: URLStructure;

  constructor(
    protected router: Router,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected route: ActivatedRoute,
    protected formBuilder: FormBuilder,
    protected workplaceInterfaceService: WorkplaceInterfaceService,
  ) {}

  public ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.setupForm();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      numberofstaff: '12',
    });
  }

  public onSubmit(): void {
    this.submitted = true;
    this.navigateToNextRoute();
  }

  private navigateToNextRoute(): void {
    this.router.navigate([this.flow, 'add-user-details']);
  }
}
