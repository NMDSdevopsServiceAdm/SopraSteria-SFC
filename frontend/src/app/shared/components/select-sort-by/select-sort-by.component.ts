import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-select-sort-by',
  imports: [CommonModule],
  templateUrl: './select-sort-by.component.html',
  styleUrl: './select-sort-by.component.scss',
})
export class SelectSortByComponent {
  sortByOptions = input.required<Record<string, string>[]>();
  onSortChange = output<string>();

  public handleChange(event: Event): void {
    const sortBy = (event?.currentTarget as HTMLSelectElement)?.value;
    this.onSortChange.emit(sortBy);
  }
}
