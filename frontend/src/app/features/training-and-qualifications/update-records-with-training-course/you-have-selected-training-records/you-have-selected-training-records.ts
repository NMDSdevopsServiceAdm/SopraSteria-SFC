import lodash from 'lodash';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingCourseWithLinkableRecords } from '@core/model/training-course.model';
import { TrainingCourseService } from '@core/services/training-course.service';

@Component({
  selector: 'app-you-have-selected-training-records',
  templateUrl: './you-have-selected-training-records.html',
  standalone: false,
})
export class YouHaveSelectedTrainingRecords {
  public selectedTrainingCourse: { uid: string; name: string };
  public selectedTrainingRecords: TrainingCourseService['trainingRecordsSelectedForUpdate'];
  public trainingRecordsGroupedByName: Array<string>;
  public startingPageUrl = ['../../select-a-training-course'];

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected trainingCourseService: TrainingCourseService,
  ) {}

  ngOnInit() {
    this.loadSelectedTrainingCourseAndRecords();
  }

  private loadSelectedTrainingCourseAndRecords() {
    const trainingCoursesWithLinkableRecords: TrainingCourseWithLinkableRecords[] =
      this.route.snapshot.data.trainingCoursesWithLinkableRecords ?? [];

    const selectedTrainingCourseUid = this.route.snapshot.params.trainingCourseUid;

    this.selectedTrainingCourse = trainingCoursesWithLinkableRecords.find(
      (course) => course.uid === selectedTrainingCourseUid,
    );

    this.selectedTrainingRecords = this.trainingCourseService.trainingRecordsSelectedForUpdate;

    if (!this.selectedTrainingCourse || !this.selectedTrainingRecords?.length) {
      return this.returnToStartingPage();
    }
    this.trainingRecordsGroupedByName = this.groupTrainingRecordsByName(this.selectedTrainingRecords);
  }

  private groupTrainingRecordsByName(selectedTrainingRecords: Array<{ uid: string; title: string }>): Array<string> {
    const groupedByName = lodash.groupBy(selectedTrainingRecords, 'title');
    const convertedToListEntry = Object.entries(groupedByName).map(
      ([name, records]) => `${name} (${records.length} ${records.length > 1 ? 'records' : 'record'})`,
    );

    return convertedToListEntry;
  }

  private returnToStartingPage() {
    this.router.navigate(this.startingPageUrl, { relativeTo: this.route });
  }
}
