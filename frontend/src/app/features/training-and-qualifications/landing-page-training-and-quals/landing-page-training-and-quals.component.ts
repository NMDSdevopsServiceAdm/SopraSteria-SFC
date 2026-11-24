import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCourse } from '@core/model/training-course.model';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-landing-page-training-and-quals',
  templateUrl: './landing-page-training-and-quals.component.html',
  styleUrl: './landing-page-training-and-quals.component.scss',
  standalone: false,
})
export class LandingPageTrainingAndQualsComponent {
  public workplace: Establishment;
  public workplaceUid: string;
  public cards: Card[] = [];
  public workers: Worker[];
  public workerCount: number;
  public trainingCourses: TrainingCourse[];

  constructor(
    private establishmentService: EstablishmentService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.workplace = this.route.snapshot.data.establishment;
    this.workplaceUid = this.workplace.uid;
    this.workers = this.route.snapshot.data.workers?.workers;
    this.workerCount = this.route.snapshot.data.workers?.workerCount;
    this.trainingCourses = this.route.snapshot.data.trainingCourses;

    this.setupCards();
  }

  private setupCards() {
    this.cards = [
      {
        imageSrc: '/assets/images/manage-training.svg',
        linkText: 'Manage training and qualification records',
        linkUrl: ['/workplace', this.workplaceUid, 'manage-training-and-qualification-records'],
        description: "Add, view and edit records, and see what's expiring.",
        displayLink: this.workerCount > 0,
      },
      {
        imageSrc: '/assets/images/build-courses.svg',
        linkText: 'Build and manage your list of courses',
        linkUrl: ['/workplace', this.workplaceUid, 'training-course', 'add-and-manage-training-courses'],
        description: 'Save training course details once, to speed up adding records later.',
        displayLink: this.workerCount > 0,
      },
      {
        imageSrc: '/assets/images/multiple-training.svg',
        linkText: 'Add multiple training records',
        linkUrl: ['/workplace', this.workplaceUid, 'add-multiple-training', 'select-staff'],
        description: 'Quickly add the same training record to a group of staff.',
        displayLink: this.workerCount > 0,
      },
      {
        imageSrc: '/assets/images/link-courses.svg',
        linkText: 'Link saved courses to your existing records',
        linkUrl: ['/workplace', this.workplaceUid, 'training-course', 'add-and-manage-training-courses'],
        description: 'Quickly apply course details to existing training records.',
        displayLink: this.workerCount > 0 && this.trainingCourses?.length > 0,
      },
      {
        imageSrc: '/assets/images/mandatory-training.svg',
        linkText: 'Set mandatory training categories',
        linkUrl: ['/workplace', this.workplaceUid, 'add-and-manage-mandatory-training'],
        description: 'Select which categories are mandatory.',
        displayLink: this.workerCount > 0,
      },
      {
        imageSrc: '/assets/images/expiry-alerts.svg',
        linkText: 'Change when expiry alerts appear',
        linkUrl: ['/workplace', this.workplaceUid, 'change-expires-soon-alerts'],
        description: 'Change the default 90-day warning to 30 or 60 days.',
        displayLink: this.workerCount > 0,
      },
    ];
  }

  public navigateToStaffRecords(event: Event): void {
    event.preventDefault();
    this.router.navigate(['dashboard'], { fragment: 'staff-records' });
  }
}

interface Card {
  imageSrc: string;
  linkText: string;
  linkUrl: string[];
  description: string;
  displayLink?: boolean;
}
