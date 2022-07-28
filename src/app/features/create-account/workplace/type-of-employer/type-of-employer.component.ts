import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';

@Component({
  selector: 'app-type-of-employer',
  templateUrl: '../../../../shared/directives/create-workplace/type-of-employer/type-of-employer.component.html',
})
export class TypeOfEmployerComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  private flow: string;
  public form: FormGroup;
  public formErrorsMap: ErrorDetails[];
  public submitted = false;
  public serverError: string;
  public establishment: Establishment;
  public isParent: boolean;
  private maxLength: 120;
  public options = [
    { value: 'Local Authority (adult services)', text: 'Local authority (adult services)' },
    { value: 'Local Authority (generic/other)', text: 'Local authority (generic/other)' },
    { value: 'Private Sector', text: 'Private sector' },
    { value: 'Voluntary / Charity', text: 'Voluntary or charity' },
    { value: 'Other', text: 'Other' },
  ];

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
    this.establishment = this.establishmentService.primaryWorkplace;
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

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'employerType',
        type: [
          {
            name: 'required',
            message: 'Select the type of employer',
          },
        ],
      },
      {
        item: 'other',
        type: [
          {
            name: 'maxlength',
            message: `Other Employer type must be ${this.maxLength} characters or less`,
          },
        ],
      },
    ];
  }

  public onSubmit(): void {
    console.log('submitted');
  }
}
