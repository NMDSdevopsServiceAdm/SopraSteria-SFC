import { Component } from '@angular/core';
import { TrainingRecord } from '@core/model/training.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingCourse } from '@core/model/training-course.model';
import { UntypedFormControl } from '@angular/forms';
import { Worker } from '@core/model/worker.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingService } from '@core/services/training.service';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { AlertService } from '@core/services/alert.service';

@Component({
  selector: 'app-remove-training-course',
  templateUrl: './remove-training-course.component.html',
})
export class RemoveTrainingCourseComponent {
  public userSelectedTrainingCourse = new UntypedFormControl('');
  public trainingRecord: TrainingRecord;
  public trainingCourses: TrainingCourse[];
  public worker: Worker;
  public workplace: Establishment;
  public trainingName: string;

  constructor(
    private backLinkService: BackLinkService,
    private route: ActivatedRoute,
    private router: Router,
    protected trainingCourseService: TrainingCourseService,
    protected alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.setBackLink();

    this.trainingCourses = this.route.snapshot.data?.trainingCourses ?? [];
    const courseUid = this.route.snapshot.paramMap.get('trainingCourseUid');
    const course = this.trainingCourses.find((c) => c.uid === courseUid);
    this.trainingName = course.name;

    this.trainingRecord = this.route.snapshot.data.trainingRecord;
    this.trainingCourses = this.route.snapshot.data.trainingCourses;
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    // this.router.navigate(['workplace', this.workplace.uid, 'training-course', 'add-and-manage-training-courses']);

    this.router.navigate(['../../add-and-manage-training-courses'], { relativeTo: this.route });
  }
}
