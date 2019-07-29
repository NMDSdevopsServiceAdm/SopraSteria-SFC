import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddWorkplaceCompleteComponent } from './add-workplace-complete.component';

describe('AddWorkplaceCompleteComponent', () => {
  let component: AddWorkplaceCompleteComponent;
  let fixture: ComponentFixture<AddWorkplaceCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddWorkplaceCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddWorkplaceCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
