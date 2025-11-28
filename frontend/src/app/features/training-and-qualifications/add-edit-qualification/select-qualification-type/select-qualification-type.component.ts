import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { AvailableQualificationsResponse, Qualification, QualificationType } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerService } from '@core/services/worker.service';
import {
  AccordionGroup,
} from '@shared/components/accordions/radio-button-accordion/grouped-radio-button-accordion/grouped-radio-button-accordion.component';

@Component({
    selector: 'app-select-qualification-type',
    templateUrl: './select-qualification-type.component.html',
    standalone: false
})
export class SelectQualificationTypeComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public submitted: boolean = false;
  public error = false;
  public formErrorsMap: Array<ErrorDetails>;
  public preFilledId: number;

  public worker: Worker;
  public establishmentUid: string;
  public workerUid: string;

  private _qualificationGroups: AccordionGroup[] = [];
  private qualificationLookup: Record<number, Qualification>;

  constructor(
    private formBuilder: FormBuilder,
    private qualificationService: QualificationService,
    private router: Router,
    private backLinkService: BackLinkService,
    private workerService: WorkerService,
    private route: ActivatedRoute,
    private errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit(): void {
    this.worker = this.workerService.worker;
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
    const availableQualifications: AvailableQualificationsResponse[] = this.route.snapshot.data.availableQualifications;
    this.qualificationGroups = this.sortQualificationsByGroup(availableQualifications);
    this.buildLookupDict(availableQualifications);
  }

  private convertToAccordionItems(
    availableQualification: AvailableQualificationsResponse,
    index: number,
  ): AccordionGroup {
    const { type, qualifications } = availableQualification;
    const accordionItems = qualifications.map((qualification) => {
      return { id: qualification.id, label: qualification.title };
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

  private buildLookupDict(allQualifications: AvailableQualificationsResponse[]): void {
    this.qualificationLookup = {};
    allQualifications.forEach((group) => {
      group.qualifications.forEach((qualification) => {
        this.qualificationLookup[qualification.id] = { ...qualification, group: group.type };
      });
    });
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        selectedQualification: [null, Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  private prefillForm(): void {
    if (this.qualificationService.selectedQualification) {
      const selectedId = this.qualificationService.selectedQualification.id;

      this.form.setValue({ selectedQualification: selectedId });
      this.preFilledId = selectedId;
    }
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'selectedQualification',
        type: [
          {
            name: 'required',
            message: 'Select the qualification type',
          },
        ],
      },
    ];
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public onSubmit(event: Event) {
    event.preventDefault();

    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.invalid) {
      this.error = true;
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const selectedId = this.form.value.selectedQualification;
    const { group, title } = this.qualificationLookup[selectedId];
    this.qualificationService.setSelectedQualification(selectedId, title, group as QualificationType);
    this.router.navigate(['./qualification-details'], { relativeTo: this.route });
  }

  public onCancel(event: Event) {
    event.preventDefault();
    this.qualificationService.clearSelectedQualification();
    this.router.navigate([
      '/workplace',
      this.establishmentUid,
      'training-and-qualifications-record',
      this.workerUid,
      'training',
    ]);
  }
}
