import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';

enum FlagType {
  Red = 'RedFlag',
  Amber = 'AmberFlag',
  Green = 'GreenTick',
  None = 'NoFlag',
}
interface Section {
  title: string;
  message: string;
  fragment: string;
  showLink: boolean;
  showFlag: FlagType;
}

@Component({
  selector: 'app-wdf-summary-panel',
  templateUrl: './wdf-summary-panel.component.html',
  styleUrls: ['../summary-section/summary-section.component.scss', './wdf-summary-panel.component.scss'],
  providers: [DatePipe],
  standalone: false,
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
  @Input() subsidiariesCount: number;

  public sections: Section[] = [];
  public meetingMessage: string;
  public notMeetingMessage: string;
  public someSubsMeetingMessage: string;
  readonly FlagType = FlagType;

  constructor(
    private router: Router,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.setMessages();
    this.getSections();
  }

  ngOnChanges(): void {
    this.getSections();
  }

  private setMessages(): void {
    const formattedStartDate = this.datePipe.transform(this.wdfStartDate, 'yyyy');
    const formattedEndDate = this.datePipe.transform(this.wdfEndDate, 'yyyy');

    this.meetingMessage = `Your data has met the funding requirements for ${formattedStartDate} to ${formattedEndDate}`;
    this.notMeetingMessage = `Your data does not meet the funding requirements for ${formattedStartDate} to ${formattedEndDate}`;
    this.someSubsMeetingMessage = `Some data does not meet the funding requirements for ${formattedStartDate} to ${formattedEndDate}`;
  }

  public getSections(): void {
    this.sections = [];

    this.getWorkplaceSection();
    this.getStaffSection();

    if (this.isParent) {
      this.getOtherWorkplacesSection();
    }
  }

  private addSection(
    title: string,
    fragment: string,
    specificEligibility: boolean,
    getNotMeetingMessage?: () => string,
  ): void {
    const meetRequirements = specificEligibility || this.overallWdfEligibility;
    const showLink = this.activatedFragment !== fragment;

    getNotMeetingMessage = getNotMeetingMessage ?? (() => this.notMeetingMessage);

    this.sections.push({
      title,
      fragment,
      showLink,
      showFlag: meetRequirements ? FlagType.Green : FlagType.Red,
      message: meetRequirements ? this.meetingMessage : getNotMeetingMessage(),
    });
  }

  private getWorkplaceSection(): void {
    this.addSection('Workplace', 'workplace', this.workplaceWdfEligibilityStatus);
  }

  private getStaffSection(): void {
    this.addSection('Staff records', 'staff', this.staffWdfEligibilityStatus);
  }

  private getOtherWorkplacesSection(): void {
    const getNotMeetingMessage = () => {
      if (!this.subsidiariesOverallWdfEligibility && this.someSubsidiariesMeetingRequirements) {
        return this.someSubsMeetingMessage;
      }
      return this.notMeetingMessage;
    };

    this.addSection(
      'Your other workplaces',
      'workplaces',
      this.subsidiariesOverallWdfEligibility,
      getNotMeetingMessage,
    );
  }

  public onClick(event: Event, fragment: string): void {
    event.preventDefault();

    const urlToNavigateTo = this.onDataPage ? [] : ['/funding/data'];
    this.router.navigate(urlToNavigateTo, { fragment: fragment });
  }
}
