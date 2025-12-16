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
      this.returnToStartPage();
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
      this.returnToStartPage();
    }
  }

  private deleteTrainingCourseRecord(): void {
    this.subscriptions.add(
      this.trainingCourseService.deleteTrainingCourse(this.workplace.uid, this.trainingCourseUid).subscribe(() => {
        this.returnToStartPage().then(() => {
          this.alertService.addAlert({
            type: 'success',
            message: 'Training course removed',
          });
        });
      }),
    );
  }

  private deleteAllTrainingCourses(): void {
    this.subscriptions.add(
      this.trainingCourseService.deleteAllTrainingCourses(this.workplace.uid).subscribe(() => {
        this.returnToStartPage().then(() => {
          this.alertService.addAlert({
            type: 'success',
            message: 'Training courses removed',
          });
        });
      }),
    );
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private returnToStartPage(): Promise<boolean> {
    return this.router.navigate([
      'workplace',
      this.workplace.uid,
      'training-course',
      'add-and-manage-training-courses',
    ]);
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
    this.returnToStartPage();
  }
}
