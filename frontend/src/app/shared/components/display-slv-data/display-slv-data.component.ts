import { Component, Input } from '@angular/core';
import { Leaver, Starter, Vacancy } from '@core/model/establishment.model';

@Component({
  selector: 'app-display-slv-data',
  templateUrl: './display-slv-data.component.html',
  styleUrl: './display-slv-data.component.scss',
  standalone: false,
})
export class DisplaySlvDataComponent {
  @Input() slvData: string | Starter[] | Leaver[] | Vacancy[];

  public isArray(variable: any): variable is Starter[] | Leaver[] | Vacancy[] {
    return Array.isArray(variable);
  }
}
