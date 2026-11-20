import { Component } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-landing-page-training-and-quals',
  templateUrl: './landing-page-training-and-quals.component.html',
  styleUrl: './landing-page-training-and-quals.component.scss',
  standalone: false,
})
export class LandingPageTrainingAndQualsComponent {
  public workplaceId: string;
  public cards: Card[] = [];

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit() {
    this.workplaceId = this.establishmentService.establishmentId;
    this.cards = this.fillInWorkplaceUid(Cards);
  }

  fillInWorkplaceUid(cards: Card[]): Card[] {
    return cards.map((card) => {
      const linkUrl = card.linkUrl;
      const linkUrlWithWorkplaceUid = linkUrl.map((part) => (part === '$workplaceUid' ? this.workplaceId : part));
      return { ...card, linkUrl: linkUrlWithWorkplaceUid };
    });
  }
}

const Cards: Card[] = [
  {
    imageSrc: '/assets/images/manage-training.svg',
    linkText: 'Manage training and qualification records',
    linkUrl: ['/workplace', '$workplaceUid', 'manage-training-and-qualification-records'],
    description: "Add, view and edit records, and see what's expiring.",
  },
  {
    imageSrc: '/assets/images/build-courses.svg',
    linkText: 'Build and manage your list of courses',
    linkUrl: ['/workplace', '$workplaceUid', 'training-course', 'add-and-manage-training-courses'],
    description: 'Save training course details once, to speed up adding records later.',
  },
  {
    imageSrc: '/assets/images/multiple-training.svg',
    linkText: 'Add multiple training records',
    linkUrl: ['/workplace', '$workplaceUid', 'add-multiple-training', 'select-staff'],
    description: 'Quickly add the same training record to a group of staff.',
  },
  {
    imageSrc: '/assets/images/link-courses.svg',
    linkText: 'Link saved courses to your existing records',
    linkUrl: ['/workplace', '$workplaceUid', 'training-course', 'add-and-manage-training-courses'],
    description: 'Quickly apply course details to existing training records.',
  },
  {
    imageSrc: '/assets/images/mandatory-training.svg',
    linkText: 'Set mandatory training categories',
    linkUrl: ['/workplace', '$workplaceUid', 'add-and-manage-mandatory-training'],
    description: 'Select which categories are mandatory.',
  },
  {
    imageSrc: '/assets/images/expiry-alerts.svg',
    linkText: 'Change when expiry alerts appear',
    linkUrl: ['/workplace', '$workplaceUid', 'change-expires-soon-alerts'],
    description: 'Change the default 90-day warning to 30 or 60 days.',
  },
];

interface Card {
  imageSrc: string;
  linkText: string;
  linkUrl: string[];
  description: string;
}
