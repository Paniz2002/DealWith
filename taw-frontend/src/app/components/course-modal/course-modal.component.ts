import {Component, Inject} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose, MatDialogTitle
} from '@angular/material/dialog';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
import {AuctionService} from '../../services/bid/auction.service';
import {MatFormField} from "@angular/material/form-field";
import {MatButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";

interface University {
  id: string;
  name: string;
  city_name: string;
}

@Component({
  selector: 'app-course-modal',
  templateUrl: './course-modal.component.html',
  imports: [
    MatDialogContent,
    MatFormField,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatInput,
    ReactiveFormsModule,
    MatDialogTitle,
    MatSelect,
    MatOption
  ],
  standalone: true
})
export class CourseModalComponent {
  courseForm: FormGroup;
  universities: University[] = [];


  constructor(
    public dialogRef: MatDialogRef<CourseModalComponent>,
    private fb: FormBuilder,
    private auctionService: AuctionService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.universities = []; //TODO get universities

    this.courseForm = this.fb.group({
      name: ['', [Validators.required]],
      year1: ['', [Validators.required, Validators.min(1970), Validators.max(new Date().getFullYear())]],
      year2: ['', [Validators.required, Validators.min(1970), Validators.max(new Date().getFullYear())]],
      university: ['', [Validators.required]]

    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  saveCourse(): void {
    if (this.courseForm.valid) {
      this.auctionService.addCourse(this.courseForm.value).then(newCourse => {
        this.dialogRef.close(newCourse);
      }).catch(err => {
        this.dialogRef.close(null);
      });
    }
  }
}
