import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectMainService } from './select-main-service';

describe('SelectMainService', () => {
  let component: SelectMainService;
  let fixture: ComponentFixture<SelectMainService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectMainService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectMainService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
