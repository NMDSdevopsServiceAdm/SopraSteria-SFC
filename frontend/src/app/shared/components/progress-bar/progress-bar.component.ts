import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent implements OnInit {
  @Input() header: string;
  @Input() sections: string[];
  @Input() currentSection: string;
  @Input() completeProgressBar = false;
  @Input() currentSectionComplete = false;
  public currentSectionIndex: number;

  public ngOnInit(): void {
    this.currentSectionIndex = this.sections.indexOf(this.currentSection);
  }
}
