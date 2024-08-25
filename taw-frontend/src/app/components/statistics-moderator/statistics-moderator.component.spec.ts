import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsModeratorComponent } from './statistics-moderator.component';

describe('StatisticsModeratorComponent', () => {
  let component: StatisticsModeratorComponent;
  let fixture: ComponentFixture<StatisticsModeratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsModeratorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatisticsModeratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
