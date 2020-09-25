import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { ComparisonGroupHeaderComponent } from '@shared/components/benchmarks-tab/comparison-group-header/comparison-group-header.component';
import { within } from '@testing-library/angular';
import { By } from '@angular/platform-browser';


describe('ComparisonGroupHeaderComponent', () => {
  let component: ComparisonGroupHeaderComponent;
  let fixture: ComponentFixture<ComparisonGroupHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers:[]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComparisonGroupHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.meta = {workplaces: 1, staff:1};
    expect(component).toBeTruthy();
  });
  it('should have the right text with only one workplace', async () => {
    component.meta = {workplaces: 1, staff:1};
    fixture.detectChanges();
    const componenttext = fixture.debugElement.query(By.css('p')).nativeElement;
    expect(componenttext.innerHTML).toContain(`<b>Your comparison group</b> is 1 staff from 1 workplace providing the same main service as you in your local authority.`);
  });
  it('should have the right text with correct comma placement', async () => {
    component.meta = {workplaces: 1000, staff:1000};
    fixture.detectChanges();
    const componenttext = fixture.debugElement.query(By.css('p')).nativeElement;
    expect(componenttext.innerHTML).toContain(`<b>Your comparison group</b> is 1,000 staff from 1,000 workplaces providing the same main service as you in your local authority.`);
  });
  it('should have the right text with no data', async () => {
    fixture.detectChanges();
    const componenttext = fixture.debugElement.query(By.css('p')).nativeElement;
    expect(componenttext.innerHTML).toContain(`<b>Your comparison group</b> information is not available at the moment.`);
  });
  it('should pluralize workplaces correctly', () => {
    const number = component.pluralizeWorkplaces(2);
    expect(number).toBe('workplaces');
  });
  it('should singularize workplaces correctly', () => {
    const number = component.pluralizeWorkplaces(1);
    expect(number).toBe('workplace');
  });

});
