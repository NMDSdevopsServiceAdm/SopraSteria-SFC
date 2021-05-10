import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WdfPaginationComponent } from './wdf-pagination.component';

describe('WdfPaginationComponent', () => {
  let component: WdfPaginationComponent;
  let fixture: ComponentFixture<WdfPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WdfPaginationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
