import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { AvailableQualificationsResponse, QualificationType } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerService } from '@core/services/worker.service';
import { AccordionGroup } from '@shared/components/accordions/radio-button-accordion/grouped-radio-button-accordion/grouped-radio-button-accordion.component';

@Component({
  selector: 'app-select-qualification-type',
  templateUrl: './select-qualification-type.component.html',
  styleUrls: ['./select-qualification-type.component.scss'],
})
export class SelectQualificationTypeComponent implements OnInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public submitted: boolean = false;
  public title: string;
  public section: string;
  public submitButtonText: string;
  public _qualificationGroups: AccordionGroup[];
  public formErrorsMap: Array<ErrorDetails>;
  public preFilledId: number;
  public error = false;
  public worker: Worker;
  public establishmentUid: string;
  public workerUid: string;

  ngOnInit(): void {
    this.worker = this.workerService.worker;
    this.setTitle();
    this.setSectionHeading();
    this.setButtonText();
    this.setBackLink();
    this.route.params.subscribe((params) => {
      if (params) {
        this.establishmentUid = params.establishmentuid;
        this.workerUid = params.id;
      }
    });
    this.getAllAvailableQualifications();
    this.setupForm();
    this.prefillForm();
    this.setupFormErrorsMap();
  }

  constructor(
    protected formBuilder: FormBuilder,
    protected qualificationService: QualificationService,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected workerService: WorkerService,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
  ) {}

  protected setTitle(): void {
    this.title = 'Select the type of qualification you want to add';
  }

  protected setSectionHeading(): void {
    this.section = this.worker.nameOrId;
  }
  protected setButtonText(): void {
    this.submitButtonText = 'Continue';
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  get qualificationGroups() {
    return this._qualificationGroups;
  }

  set qualificationGroups(qualificationGroups: AccordionGroup[]) {
    this._qualificationGroups = qualificationGroups;
  }

  private getAllAvailableQualifications(): void {
    this.workerService
      .getAllAvailableQualifications(this.establishmentUid, this.workerUid)
      .subscribe((allQualifications) => {
        this.qualificationGroups = this.sortQualificationsByGroup(allQualifications);
      });
  }

  private convertToAccordionItems(
    availableQualification: AvailableQualificationsResponse,
    index: number,
  ): AccordionGroup {
    const { type, qualifications } = availableQualification;
    const accordionItems = qualifications.map((qual) => {
      return { id: qual.id, label: qual.title };
    });

    return {
      open: false,
      index,
      title: type,
      descriptionText: '',
      items: accordionItems,
    };
  }

  private sortQualificationsByGroup(allQualifications: AvailableQualificationsResponse[]): AccordionGroup[] {
    const others = allQualifications.find((group) => group.type === QualificationType.Other);

    const nonOthers = allQualifications
      .filter((group) => group.type !== QualificationType.Other)
      .sort((groupA, groupB) => groupA.type.localeCompare(groupB.type));

    const allQualsAsAccordionItems = [...nonOthers, others].map(this.convertToAccordionItems);

    return allQualsAsAccordionItems;
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        qualificationType: [null, Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  private prefillForm(): void {
    this.preFilledId = 1;
  }

  private setupFormErrorsMap(): void {}

  public onSubmit(event: Event) {
    event.preventDefault();
  }

  public onCancel(event: Event) {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
  }

  ngOnDestroy(): void {}
}
