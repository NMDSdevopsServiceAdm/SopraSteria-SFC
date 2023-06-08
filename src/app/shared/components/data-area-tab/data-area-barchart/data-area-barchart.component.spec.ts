import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAreaBarchartComponent } from './data-area-barchart.component';

describe('DataAreaBarchartComponent', () => {
  let component: DataAreaBarchartComponent;
  let fixture: ComponentFixture<DataAreaBarchartComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DataAreaBarchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });
});
