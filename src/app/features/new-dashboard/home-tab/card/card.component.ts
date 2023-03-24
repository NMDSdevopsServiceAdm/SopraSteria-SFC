import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() benchmarksCard: boolean;
  public image: string;

  ngOnInit(): void {
    this.image = this.benchmarksCard ? '/assets/images/benchmarks.svg' : '/assets/images/benefits-bundle.svg';
  }
}
