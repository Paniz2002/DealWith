import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseModalComponent } from './course-modal.component';

describe('BookModalComponent', () => {
  let component: CourseModalComponent;
  let fixture: ComponentFixture<CourseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
