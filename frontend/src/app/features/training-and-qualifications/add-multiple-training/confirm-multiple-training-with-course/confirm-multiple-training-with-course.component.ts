import { Component } from '@angular/core';
import { Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingService } from '@core/services/training.service';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCourse } from '@core/model/training-course.model';
import dayjs from 'dayjs';
import { WorkerService } from '@core/services/worker.service';
import { Alert } from '@core/model/alert.model';
import { AlertService } from '@core/services/alert.service';
import { DeliveredBy } from '@core/model/training.model';

@Component({
  selector: 'app-confirm-multiple-training-with-course',
  templateUrl: './confirm-multiple-training-with-course.component.html',
  styleUrl: './confirm-multiple-training-with-course.component.scss',
  standalone: false,
})
export class ConfirmMultipleTrainingWithCourseComponent {
  public notes: string;
  public trainingRecordCompletionDate: Date;
  public trainingCourseDataForSummaryList: { key: string; value: string }[];
  public trainingCourse: TrainingCourse;
  public workers: Worker[];
  public workplace: Establishment;

  constructor(
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    private backLinkService: BackLinkService,
    private trainingService: TrainingService,
    public workerService: WorkerService,
  ) {}

  ngOnInit(): void {
    this.notes = this.trainingService.getNotes();
    this.setBackLink();
    this.trainingCourse = this.trainingService.getSelectedTrainingCourse();
    this.workplace = this.route.snapshot.data.establishment;
    this.workers = this.trainingService.getSelectedStaff();

    if (!this.trainingCourse) {
      this.router.navigate([`workplace/${this.workplace.uid}/add-multiple-training/select-staff`]);
      return;
    }

    this.trainingRecordCompletionDate = this.trainingService.getCourseCompletionDate();
    this.generateTrainingCourseDataForSummaryList();
  }

  public getRoutePath(pageName: string): Array<string> {
    return ['/workplace', this.workplace.uid, 'add-multiple-training', pageName];
  }

  public onSubmit(): void {
    const selectedStaff = this.workers.map((worker) => worker.uid);

    const trainingCourse = this.trainingCourse;
    const completedDate = this.trainingRecordCompletionDate
      ? dayjs(this.trainingRecordCompletionDate).format('YYYY-MM-DD')
      : null;
    const trainingRecordDetails = {
      trainingCategory: { id: trainingCourse.trainingCategoryId },
      title: trainingCourse.name,
      trainingCategoryName: trainingCourse.trainingCategoryName,
      accredited: trainingCourse.accredited,
      deliveredBy: trainingCourse.deliveredBy,
      externalProviderName: trainingCourse.externalProviderName,
      otherTrainingProviderName: trainingCourse.otherTrainingProviderName,
      howWasItDelivered: trainingCourse.howWasItDelivered,
      validityPeriodInMonth: trainingCourse.validityPeriodInMonth,
      completed: completedDate,
      notes: this.notes,
    };

    this.workerService
      .createMultipleTrainingRecords(this.workplace.uid, selectedStaff, trainingRecordDetails)
      .subscribe(() => this.onSuccess());
  }

  private generateTrainingCourseDataForSummaryList(): void {
    const trainingCourse = this.trainingCourse;
    this.trainingCourseDataForSummaryList = [
      { key: 'Training course name', value: trainingCourse.name ? trainingCourse.name : '-' },
      { key: 'Training category', value: trainingCourse.trainingCategoryName },
      { key: 'Is the training course accredited?', value: trainingCourse.accredited ? trainingCourse.accredited : '-' },
      {
        key: 'Who delivered the training course?',
        value: trainingCourse.deliveredBy ? trainingCourse.deliveredBy : '-',
      },
      {
        key: 'Training provider name',
        value: trainingCourse.externalProviderName ? trainingCourse.externalProviderName : '-',
      },
      {
        key: 'How was the training course delivered?',
        value: trainingCourse.howWasItDelivered ? trainingCourse.howWasItDelivered : '-',
      },
      {
        key: 'How long is the training valid for?',
        value: this.showCorrectTrainingValidity(trainingCourse),
      },
      {
        key: 'Training completion date',
        value: this.trainingRecordCompletionDate ? dayjs(this.trainingRecordCompletionDate).format('D MMM YYYY') : '-',
      },
      { key: 'Notes', value: this.notes ? this.notes : 'No notes added' },
    ];

    if (trainingCourse.deliveredBy === DeliveredBy.InHouseStaff) {
      this.removeTrainingProviderNameFromSummaryListData();
    }
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private showCorrectTrainingValidity(trainingCourse: any): string {
    if (!trainingCourse.validityPeriodInMonth && !trainingCourse.doesNotExpire) {
      return '-';
    }

    if (trainingCourse.validityPeriodInMonth > 1) {
      return `${trainingCourse.validityPeriodInMonth} months`;
    } else if (trainingCourse.validityPeriodInMonth === 1) {
      return `${trainingCourse.validityPeriodInMonth} month`;
    } else if (trainingCourse.doesNotExpire) {
      return 'Does not expire';
    }
  }

  private async onSuccess() {
    this.trainingService.resetState();

    let record = 'record';
    if (this.workers.length !== 1) {
      record += 's';
    }

    const message = `${this.workers.length} training ${record} added`;
    await this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
    this.alertService.addAlert({
      type: 'success',
      message: message,
    } as Alert);
  }

  private removeTrainingProviderNameFromSummaryListData(): void {
    this.trainingCourseDataForSummaryList = this.trainingCourseDataForSummaryList.filter(
      (item) => item.key !== 'Training provider name',
    );
  }
}
