import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsStudentComponent } from './statistics-student.component';

describe('StatisticsStudentComponent', () => {
  let component: StatisticsStudentComponent;
  let fixture: ComponentFixture<StatisticsStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsStudentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatisticsStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
