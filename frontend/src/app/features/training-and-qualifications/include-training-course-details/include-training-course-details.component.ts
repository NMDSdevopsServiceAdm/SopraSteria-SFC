import { Component } from '@angular/core';
import { TrainingRecord } from '@core/model/training.model';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TrainingCourse } from '@core/model/training-course.model';
import { UntypedFormControl } from '@angular/forms';
import { Worker } from '@core/model/worker.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingService } from '@core/services/training.service';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-include-training-course-details',
  templateUrl: './include-training-course-details.component.html',
  styleUrl: './include-training-course-details.component.scss',
  standalone: false,
})
export class IncludeTrainingCourseDetailsComponent {
  public userSelectedTrainingCourse = new UntypedFormControl('');
  public trainingRecord: TrainingRecord;
  public trainingCourses: TrainingCourse[];
  public worker: Worker;
  public workplace: Establishment;
  public revealText = TrainingCourseService.RevealText;

  constructor(
    private backLinkService: BackLinkService,
    private route: ActivatedRoute,
    private router: Router,
    private trainingService: TrainingService,
  ) {}

  ngOnInit(): void {
    this.setBackLink();
    this.trainingRecord = this.route.snapshot.data.trainingRecord;
    this.trainingCourses = this.route.snapshot.data.trainingCourses;
    this.workplace = this.route.snapshot.data.establishment;
    this.worker = this.route.snapshot.data.worker;
    this.clearSelectedTrainingCourseWhenClickedAway();
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public onSubmit(): void {
    if (this.userSelectedTrainingCourse.value === '' || this.userSelectedTrainingCourse.value === false) {
      const previousPage = [
        '/workplace',
        this.workplace.uid,
        'training-and-qualifications-record',
        this.worker.uid,
        'training',
        this.trainingRecord.uid,
      ];
      this.router.navigate(previousPage);
      return;
    }

    if (this.userSelectedTrainingCourse.value === true) {
      this.trainingService.setSelectedTrainingCourse(this.trainingCourses[0]);
    } else {
      const userSelectedTrainingCourseFullDetails = this.trainingCourses.find((trainingCourse) => {
        return trainingCourse.id === this.userSelectedTrainingCourse.value;
      });
      this.trainingService.setSelectedTrainingCourse(userSelectedTrainingCourseFullDetails);
    }

    this.router.navigate([
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      this.worker.uid,
      'training',
      this.trainingRecord.uid,
      'matching-layout',
    ]);
  }

  private clearSelectedTrainingCourseWhenClickedAway() {
    const parentPath = this.trainingRecord.uid;

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => !event.urlAfterRedirects?.includes(parentPath)),
        take(1),
      )
      .subscribe(() => {
        this.trainingService.setSelectedTrainingCourse(null);
      });
  }
}
