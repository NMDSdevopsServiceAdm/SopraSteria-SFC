import { Directive, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';

@Directive()
export class TypeOfEmployerDirective implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  private flow: string;
  public form: FormGroup;
  public formErrorsMap: ErrorDetails[];
  public sumbitted = false;
  public serverError: string;
  public workplace: Establishment;
  public isParent: boolean;
  private maxLength = 120;

  constructor(
    protected formBuilder: FormBuilder,
    public backService: BackService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
    public workplaceInterfaceService: WorkplaceInterfaceService,
    protected establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.setupForm();
    this.workplace = this.establishmentService.primaryWorkplace;
    this.isParent = !!this.workplace?.isParent;
  }

  public ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        employerType: ['', Validators.required],
        other: [null, Validators.maxLength(this.maxLength)],
      },
      { updateOn: 'submit' },
    );
  }
}
