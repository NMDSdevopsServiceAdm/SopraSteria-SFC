import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAreaRankingComponent } from './data-area-ranking.component';

describe('DataAreaRankingComponent', () => {
  let component: DataAreaRankingComponent;
  let fixture: ComponentFixture<DataAreaRankingComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DataAreaRankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });
});
