import { Subscription } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCourse } from '@core/model/training-course.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingCourseService } from '@core/services/training-course.service';

type JourneyType = 'RemoveSingle' | 'RemoveAll';

@Component({
  selector: 'app-remove-training-course',
  templateUrl: './remove-training-course.component.html',
  styleUrl: './remove-training-course.component.scss',
})
export class RemoveTrainingCourseComponent implements OnInit {
  public trainingCourses: TrainingCourse[];
  public workplace: Establishment;
  public trainingCourseName: string;
  public trainingCourseUid: string;
  public journeyType: JourneyType;
  public subscriptions: Subscription = new Subscription();

  constructor(
    private backLinkService: BackLinkService,
    private route: ActivatedRoute,
    private router: Router,
    private trainingCourseService: TrainingCourseService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.determineJourneyType();
    this.loadTrainingCourses();
    this.setBackLink();
  }

  private determineJourneyType(): void {
    this.journeyType = this.route.snapshot.data?.journeyType ?? 'RemoveSingle';
  }

  private loadTrainingCourses(): void {
    this.trainingCourses = this.route.snapshot.data?.trainingCourses;
    if (!this.trainingCourses?.length) {
      // return to start
    }

    if (this.journeyType === 'RemoveSingle') {
      this.loadSelectedTrainingCourse();
    }
  }

  private loadSelectedTrainingCourse(): void {
    this.trainingCourseUid = this.route.snapshot.params.trainingCourseUid;
    const course = this.trainingCourses?.find((c) => c.uid === this.trainingCourseUid);
    this.trainingCourseName = course?.name;
    if (!course) {
      // return to start
    }
  }

  public deleteTrainingCourseRecord(): void {
    this.subscriptions.add(
      this.trainingCourseService.deleteTrainingCourse(this.workplace.uid, this.trainingCourseUid).subscribe(() => {
        this.router.navigate(['../../add-and-manage-training-courses'], { relativeTo: this.route }).then(() => {
          this.alertService.addAlert({
            type: 'success',
            message: 'Training course removed',
          });
        });
      }),
    );
  }

  public deleteAllTrainingCourses(): void {
    this.subscriptions.add(
      this.trainingCourseService.deleteAllTrainingCourses(this.workplace.uid).subscribe(() => {
        this.router.navigate(['../../add-and-manage-training-courses'], { relativeTo: this.route }).then(() => {
          this.alertService.addAlert({
            type: 'success',
            message: 'All training courses removed',
          });
        });
      }),
    );
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public onSubmit(): void {
    switch (this.journeyType) {
      case 'RemoveSingle': {
        this.deleteTrainingCourseRecord();
        return;
      }
      case 'RemoveAll': {
        this.deleteAllTrainingCourses();
        return;
      }
    }
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate(['../../add-and-manage-training-courses'], { relativeTo: this.route });
  }
}
