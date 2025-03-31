import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wdf-summary-panel',
  templateUrl: './wdf-summary-panel.component.html',
  styleUrls: ['../summary-section/summary-section.component.scss', './wdf-summary-panel.component.scss'],
  providers: [DatePipe],
})
export class WdfSummaryPanel implements OnInit, OnChanges {
  @Input() workplaceWdfEligibilityStatus: boolean;
  @Input() staffWdfEligibilityStatus: boolean;
  @Input() wdfStartDate: string;
  @Input() wdfEndDate: string;
  @Input() isParent: boolean;
  @Input() subsidiariesOverallWdfEligibility: boolean;
  @Input() overallWdfEligibility: boolean;
  @Input() activatedFragment: string;
  @Input() onDataPage: boolean = true;
  @Input() someSubsidiariesMeetingRequirements: boolean;

  public sections: any = [];
  public meetingMessage: string;
  public notMeetingMessage: string;
  public someSubsMeetingMessage: string;

  constructor(private router: Router, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.setMessages();
    this.getSections();
    this.showLink(this.activatedFragment);
  }

  ngOnChanges(): void {
    this.getSections();
    this.showLink(this.activatedFragment);
  }

  private setMessages(): void {
    const formattedStartDate = this.datePipe.transform(this.wdfStartDate, 'yyyy');
    const formattedEndDate = this.datePipe.transform(this.wdfEndDate, 'yyyy');

    this.meetingMessage = `Your data has met the funding requirements for ${formattedStartDate} to ${formattedEndDate}`;
    this.notMeetingMessage = `Your data does not meet the funding requirements for ${formattedStartDate} to ${formattedEndDate}`;
    this.someSubsMeetingMessage = `Some data does not meet the funding requirements for ${formattedStartDate} to ${formattedEndDate}`;
  }

  public getSections(): void {
    this.sections = [
      {
        title: 'Workplace',
        eligibility:
          this.workplaceWdfEligibilityStatus || (!this.workplaceWdfEligibilityStatus && this.overallWdfEligibility),
        fragment: 'workplace',
        showLink: true,
        meetingMessage: this.meetingMessage,
        notMeetingMessage: this.notMeetingMessage,
      },
      {
        title: 'Staff records',
        eligibility: this.staffWdfEligibilityStatus || (!this.staffWdfEligibilityStatus && this.overallWdfEligibility),
        fragment: 'staff',
        showLink: true,
        meetingMessage: this.meetingMessage,
        notMeetingMessage: this.notMeetingMessage,
      },
    ];

    if (this.isParent) {
      this.sections.push({
        title: 'Your other workplaces',
        eligibility: this.subsidiariesOverallWdfEligibility,
        fragment: 'workplaces',
        showLink: true,
        meetingMessage: this.meetingMessage,
        notMeetingMessage: this.getOtherWorkplacesNotMeetingMessage(),
      });
    }
  }

  public onClick(event: Event, fragment: string): void {
    event.preventDefault();

    const urlToNavigateTo = this.onDataPage ? [] : ['/funding/data'];
    this.router.navigate(urlToNavigateTo, { fragment: fragment });
  }

  private getOtherWorkplacesNotMeetingMessage(): string {
    if (!this.subsidiariesOverallWdfEligibility && this.someSubsidiariesMeetingRequirements) {
      return this.someSubsMeetingMessage;
    }
    return this.notMeetingMessage;
  }

  public showLink(fragment: string): void {
    for (var i = 0; i < this.sections.length; i++) {
      if (fragment === this.sections[i].fragment) {
        this.sections[i].showLink = false;
      } else {
        this.sections[i].showLink = true;
      }
    }
  }
}
