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
  public selectedTrainingRecords: Array<{ uid: string; title: string }>;

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
      // return to start
    }
  }
}
