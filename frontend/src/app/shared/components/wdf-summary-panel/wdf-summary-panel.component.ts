import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';

enum FlagType {
  Red = 'RedFlag',
  Orange = 'OrangeFlag',
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
  @Input() someSubsidiariesNeedCheckAgain: boolean;

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

  private getOrangeFlagMessage(fragment: string): string {
    switch (fragment) {
      case 'workplace': {
        return 'Check your workplace data';
      }
      case 'staff': {
        return 'Check your staff records';
      }
    }
    return '';
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
    getOverrides?: () => Partial<Section>,
  ): void {
    const showLink = this.activatedFragment !== fragment;
    const meetRequirements = specificEligibility;
    const metRequirementButNeedCheckAgain = this.overallWdfEligibility && !specificEligibility;

    let message;
    let showFlag;

    if (meetRequirements) {
      message = this.meetingMessage;
      showFlag = FlagType.Green;
    } else if (metRequirementButNeedCheckAgain) {
      message = this.getOrangeFlagMessage(fragment);
      showFlag = FlagType.Orange;
    } else {
      message = this.notMeetingMessage;
      showFlag = FlagType.Red;
    }

    const overrides = getOverrides ? getOverrides() : {};

    this.sections.push({
      title,
      fragment,
      showLink,
      showFlag,
      message,
      ...overrides,
    });
  }

  private getWorkplaceSection(): void {
    this.addSection('Workplace', 'workplace', this.workplaceWdfEligibilityStatus);
  }

  private getStaffSection(): void {
    this.addSection('Staff records', 'staff', this.staffWdfEligibilityStatus);
  }

  private getOtherWorkplacesSection(): void {
    const getOverrides = () => {
      if (!this.subsidiariesCount) {
        return { message: `You've not added any other workplaces yet`, showLink: false, showFlag: FlagType.None };
      }
      if (this.subsidiariesOverallWdfEligibility && this.someSubsidiariesNeedCheckAgain) {
        return { message: 'Check your other workplaces', showFlag: FlagType.Orange };
      }
      if (this.subsidiariesOverallWdfEligibility) {
        return { message: this.meetingMessage };
      }
      if (!this.subsidiariesOverallWdfEligibility && this.someSubsidiariesMeetingRequirements) {
        return { message: this.someSubsMeetingMessage };
      }
      return { message: this.notMeetingMessage };
    };

    this.addSection('Your other workplaces', 'workplaces', this.subsidiariesOverallWdfEligibility, getOverrides);
  }

  public onClick(event: Event, fragment: string): void {
    event.preventDefault();

    const urlToNavigateTo = this.onDataPage ? [] : ['/funding/data'];
    this.router.navigate(urlToNavigateTo, { fragment: fragment });
  }
}
