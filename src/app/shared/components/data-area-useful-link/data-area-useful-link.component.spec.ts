import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAreaUsefulLinkComponent } from './data-area-useful-link.component';

describe('DataAreaUsefulLinkComponent', () => {
  let component: DataAreaUsefulLinkComponent;
  let fixture: ComponentFixture<DataAreaUsefulLinkComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DataAreaUsefulLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });
});
