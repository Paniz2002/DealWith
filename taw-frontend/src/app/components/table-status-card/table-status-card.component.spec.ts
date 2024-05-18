import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableStatusCardComponent } from './table-status-card.component';

describe('TableStatusCardComponent', () => {
  let component: TableStatusCardComponent;
  let fixture: ComponentFixture<TableStatusCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableStatusCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableStatusCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
