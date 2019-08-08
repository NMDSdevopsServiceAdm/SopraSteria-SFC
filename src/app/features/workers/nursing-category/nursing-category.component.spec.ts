import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NursingCategoryComponent } from '@features/workers/nursing-category/nursing-category.component';

describe('NursingCategoryComponent', () => {
  let component: NursingCategoryComponent;
  let fixture: ComponentFixture<NursingCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NursingCategoryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NursingCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
