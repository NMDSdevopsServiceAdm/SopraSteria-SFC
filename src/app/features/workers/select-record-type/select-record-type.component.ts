import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { SelectRecordTypes } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-select-record-type',
  templateUrl: './select-record-type.component.html',
})
export class SelectRecordTypeComponent implements OnInit {
  formgroup: any;
  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    private workerService: WorkerService,
    protected router: Router,
    private location: Location
  ) {}
  public formErrorsMap: ErrorDetails[];
  public form: FormGroup;
  public url: string;
  public selectRecordTypes: SelectRecordTypes[];
  public submitted = false;
  public serverError: string;
  public establishmentuid: string;
  public id: string;
  public navigateUrl: string;

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params) {
        this.establishmentuid = params.establishmentuid;
        this.id = params.id;
      }
    });
    this.selectRecordTypes = [SelectRecordTypes.Training, SelectRecordTypes.Qualification];
    this.setBackLink();
    this.setupForm();
    this.setupFormErrorsMap();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      selectRecordType: [null, Validators.required],
    });
  }
  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'selectRecordType',
        type: [
          {
            name: 'required',
            message: 'Select a record type',
          },
        ],
      },
    ];
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
  }
  protected setBackLink(): void {
    this.url = `workplace/${this.establishmentuid}/training-and-qualifications-record/${this.id}/training`;
    this.backService.setBackLink({ url: [this.url] });
  }

  public addRecord() {
    if (this.form.value.selectRecordType === 'Qualification') {
      this.navigateUrl = `workplace/${this.establishmentuid}/training-and-qualifications-record/${this.id}/add-qualification`;
    } else if (this.form.value.selectRecordType === 'Training course') {
      this.navigateUrl = `workplace/${this.establishmentuid}/training-and-qualifications-record/${this.id}/add-training`;
    }
    if (this.navigateUrl && this.form.value.selectRecordType !== null) {
      this.router.navigate([this.navigateUrl]);
      this.route.fragment.subscribe((fragment: string) => {
        if (fragment && fragment === 'error-summary-title') {
          // This will give you current location path without including hash
          const pathWithoutHash = this.location.path(false);
          this.workerService.getRoute$.next(pathWithoutHash);
        } else {
          this.workerService.getRoute$.next(this.router.url);
        }
      });
    }
  }
}
