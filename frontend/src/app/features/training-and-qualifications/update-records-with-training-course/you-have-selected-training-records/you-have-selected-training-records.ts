import lodash from 'lodash';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingCourse, TrainingCourseWithLinkableRecords } from '@core/model/training-course.model';
import { TrainingCourseService } from '@core/services/training-course.service';
import { AlertService } from '@core/services/alert.service';

@Component({
  selector: 'app-you-have-selected-training-records',
  templateUrl: './you-have-selected-training-records.html',
  standalone: false,
})
export class YouHaveSelectedTrainingRecords {
  public selectedTrainingCourse: Pick<TrainingCourse, 'uid' | 'name'>;
  public selectedTrainingRecords: TrainingCourseService['trainingRecordsSelectedForUpdate'];
  public trainingRecordsGroupedByName: Array<string>;
  public startingPageUrl = ['../../select-a-training-course'];
  private establishmentUid: string;

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected trainingCourseService: TrainingCourseService,
    protected alertService: AlertService,
  ) {}

  ngOnInit() {
    this.loadSelectedTrainingCourseAndRecords();
    this.establishmentUid = this.route.snapshot.params?.establishmentuid;
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
    const trainingRecordsWithCount = Object.entries(groupedByName).map(([name, records]) => {
      const recordsCount = `${records.length} ${records.length > 1 ? 'records' : 'record'}`;
      return `${name} (${recordsCount})`;
    });

    return trainingRecordsWithCount;
  }

  private returnToStartingPage() {
    this.router.navigate(this.startingPageUrl, { relativeTo: this.route });
  }

  public onSubmit(): void {
    const recordOrRecords = this.selectedTrainingRecords.length === 1 ? 'record' : 'records';
    const alertMessage = `${this.selectedTrainingRecords.length} training ${recordOrRecords} updated with course details`;

    this.trainingCourseService
      .updateTrainingRecordsWithCourseDetails(
        this.establishmentUid,
        this.selectedTrainingCourse.uid,
        this.selectedTrainingRecords,
      )
      .subscribe(() => {
        this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' }).then(() => {
          this.alertService.addAlert({ type: 'success', message: alertMessage });
        });
      });
  }
}
