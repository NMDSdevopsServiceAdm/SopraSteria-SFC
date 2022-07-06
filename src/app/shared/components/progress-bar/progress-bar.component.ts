import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent implements OnInit {
  @Input() sections: string[];
  @Input() currentSection: string;
  public currentSectionIndex: number;

  public ngOnInit(): void {
    this.currentSectionIndex = this.sections.indexOf(this.currentSection);
  }
}
