import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankingContentComponent } from './ranking-content.component';

describe('RankingContentComponent', () => {
  let component: RankingContentComponent;
  let fixture: ComponentFixture<RankingContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RankingContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RankingContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
