import lodash from 'lodash';

import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TrainingCourseWithLinkableRecords } from '@core/model/training-course.model';
import { TrainingCourseService } from '@core/services/training-course.service';
import { TrainingRecord } from '@core/model/training.model';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { filter, take } from 'rxjs/operators';
import { BackLinkService } from '@core/services/backLink.service';

type TrainingRecordsGroupedByTitle = Array<{ title: string; trainingRecords: TrainingRecord[]; count: number }>;

@Component({
  selector: 'app-select-training-records-to-update',
  templateUrl: './select-training-records-to-update.component.html',
  standalone: false,
})
export class SelectTrainingRecordsToUpdateComponent {
  public revealText = TrainingCourseService.RevealText;
  public selectedTrainingCourse: TrainingCourseWithLinkableRecords;
  public selectedTrainingCourseUid: string;
  public trainingRecordsGroupedByTitle: TrainingRecordsGroupedByTitle;
  public form: UntypedFormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private trainingCourseService: TrainingCourseService,
    private backLinkService: BackLinkService,
  ) {}

  ngOnInit(): void {
    this.loadSelectedTrainingCourse();
    this.groupTrainingRecordsByTitle();
    this.setBackLink();
    this.setupForm();
    this.prefill();
    this.clearLocalDataWhenClickedAway();
  }

  private loadSelectedTrainingCourse(): void {
    const trainingCoursesWithLinkableRecords: TrainingCourseWithLinkableRecords[] =
      this.route.snapshot.data.trainingCoursesWithLinkableRecords ?? [];

    this.selectedTrainingCourseUid = this.route.snapshot.params.trainingCourseUid;

    this.selectedTrainingCourse = trainingCoursesWithLinkableRecords.find(
      (course) => course.uid === this.selectedTrainingCourseUid,
    );

    if (!this.selectedTrainingCourse || !this.selectedTrainingCourse.linkableTrainingRecords?.length) {
      this.returnToPreviousPage();
    }
  }

  private groupTrainingRecordsByTitle(): void {
    const linkableTrainingRecords = this.selectedTrainingCourse.linkableTrainingRecords;
    const withMissingTitlesFilledIn = linkableTrainingRecords.map((record) => ({
      ...record,
      title: record.title ? record.title : 'Missing training name',
    }));

    const groupedByTitle = lodash.groupBy(withMissingTitlesFilledIn, 'title');

    this.trainingRecordsGroupedByTitle = Object.entries(groupedByTitle).map(([title, trainingRecords]) => {
      return { title, trainingRecords, count: trainingRecords.length };
    });
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private setupForm(): void {
    const controlsForEachGroup = this.trainingRecordsGroupedByTitle.map(() => this.formBuilder.control(null));

    this.form = this.formBuilder.group({
      selectedTrainingRecordGroups: this.formBuilder.array(controlsForEachGroup),
    });
  }

  public get selectedTrainingRecordGroups(): UntypedFormArray {
    return this.form.get('selectedTrainingRecordGroups') as UntypedFormArray;
  }

  public get checkboxValues(): Array<boolean> {
    return this.selectedTrainingRecordGroups.value;
  }

  private prefill(): void {
    const storedSelection = this.trainingCourseService.trainingRecordsSelectedForUpdate;
    if (!storedSelection?.length) {
      return;
    }

    const titlesOfSelectedTrainingRecords = storedSelection.map((record) => record.title);

    this.trainingRecordsGroupedByTitle.forEach((group, index) => {
      if (titlesOfSelectedTrainingRecords.includes(group.title)) {
        this.selectedTrainingRecordGroups.at(index).setValue(true);
      }
    });
  }

  public onSubmit(): void {
    const noCheckboxesTicked = this.checkboxValues.every((ticked) => !ticked);

    if (noCheckboxesTicked) {
      this.returnToPreviousPage();
    } else {
      this.storeSelectionAndContinueToNextPage();
    }
  }

  private storeSelectionAndContinueToNextPage(): void {
    const checkboxIsTicked: Array<boolean> = this.checkboxValues;

    const selectedTrainingRecords: Array<TrainingRecord> = this.trainingRecordsGroupedByTitle
      .filter((_group, index) => checkboxIsTicked[index])
      .flatMap((group) => group.trainingRecords);

    this.trainingCourseService.trainingRecordsSelectedForUpdate = selectedTrainingRecords;

    this.router.navigate(['../confirm-update-records'], { relativeTo: this.route });
  }

  private returnToPreviousPage(): void {
    this.router.navigate(['../../select-a-training-course'], { relativeTo: this.route });
  }

  private clearLocalDataWhenClickedAway(): void {
    const parentPath = this.selectedTrainingCourseUid;

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => !event.urlAfterRedirects?.includes(parentPath)),
        take(1),
      )
      .subscribe(() => {
        this.trainingCourseService.trainingRecordsSelectedForUpdate = null;
      });
  }
}
