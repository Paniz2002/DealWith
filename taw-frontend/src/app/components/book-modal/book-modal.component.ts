// book-modal.component.ts
import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose, MatDialogTitle
} from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuctionService } from '../../services/bid/auction.service';
import {MatFormField} from "@angular/material/form-field";
import {MatButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";


@Component({
  selector: 'app-book-modal',
  templateUrl: './book-modal.component.html',
  imports: [
    MatDialogContent,
    MatFormField,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatInput,
    ReactiveFormsModule,
    MatDialogTitle
  ],
  standalone: true
})
export class BookModalComponent {
  bookForm: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<BookModalComponent>,
    private fb: FormBuilder,
    private auctionService: AuctionService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1)]],
      ISBN: ['', Validators.required],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  saveBook(): void {
    if (this.bookForm.valid) {
      this.auctionService.addBook(this.bookForm.value).then(newBook => {
        this.dialogRef.close(newBook);
      });
    }
  }
}
