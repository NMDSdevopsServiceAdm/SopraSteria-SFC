import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingCourse } from '@core/model/training-course.model';
import { Establishment } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { AlertService } from '@core/services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-remove-training-course',
  templateUrl: './remove-training-course.component.html',
})
export class RemoveTrainingCourseComponent implements OnInit {
  public trainingCourses: TrainingCourse[];
  public workplace: Establishment;
  public trainingName: string;
  public trainingCourseUid: string;
  public subscriptions: Subscription = new Subscription();

  constructor(
    private backLinkService: BackLinkService,
    private route: ActivatedRoute,
    private router: Router,
    protected trainingCourseService: TrainingCourseService,
    protected alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.trainingCourses = this.route.snapshot.data?.trainingCourses;
    this.trainingCourseUid = this.route.snapshot.paramMap.get('trainingCourseUid');
    const course = this.trainingCourses?.find((c) => c.uid === this.trainingCourseUid);
    this.trainingName = course?.name;
    this.setBackLink();
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

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate(['../../add-and-manage-training-courses'], { relativeTo: this.route });
  }
}
