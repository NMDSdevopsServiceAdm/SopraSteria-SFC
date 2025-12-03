import lodash from 'lodash';

import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingCourseWithLinkableRecords } from '@core/model/training-course.model';
import { TrainingCourseService } from '@core/services/training-course.service';
import { TrainingRecord } from '@core/model/training.model';

type TrainingRecordsGroupedByTitle = Array<{ title: string; trainingRecords: TrainingRecord[]; count: number }>;

@Component({
  selector: 'app-select-training-records-to-update',
  templateUrl: './select-training-records-to-update.component.html',
  standalone: false,
})
export class SelectTrainingRecordsToUpdateComponent {
  public revealText = TrainingCourseService.RevealText;
  public selectedTrainingCourse: TrainingCourseWithLinkableRecords;
  public trainingRecordsGroupedByTitle: TrainingRecordsGroupedByTitle;

  constructor(protected route: ActivatedRoute, protected router: Router) {}

  ngOnInit(): void {
    this.loadSelectedTrainingCourse();
    this.groupTrainingRecordsByTitle();
  }

  private loadSelectedTrainingCourse(): void {
    const trainingCoursesWithLinkableRecords: TrainingCourseWithLinkableRecords[] =
      this.route.snapshot.data.trainingCoursesWithLinkableRecords ?? [];

    const selectedTrainingCourseUid = this.route.snapshot.params.trainingCourseUid;

    this.selectedTrainingCourse = trainingCoursesWithLinkableRecords.find(
      (course) => course.uid === selectedTrainingCourseUid,
    );

    if (!this.selectedTrainingCourse || !this.selectedTrainingCourse.linkableTrainingRecords?.length) {
      // return to prev page
    }
  }

  private groupTrainingRecordsByTitle(): void {
    const linkableTrainingRecords = this.selectedTrainingCourse.linkableTrainingRecords;
    const grouped = lodash.groupBy(linkableTrainingRecords, 'title');

    this.trainingRecordsGroupedByTitle = Object.entries(grouped).map(([title, trainingRecords]) => {
      return { title, trainingRecords, count: trainingRecords.length };
    });
  }
}
