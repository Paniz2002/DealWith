// book-modal.component.ts
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

function isbnLengthValidator(): ValidatorFn{
  return (control: AbstractControl) => {
    if (control.value.length !== 10 && control.value.length !== 13) {
      return {isbnLength: true};
    }
    return null;
  };
}

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

    //get the data from the form
    const title = data.title ? data.title : '';
    console.log(data);

    this.bookForm = this.fb.group({
      title: [title, [Validators.required]],
      year: ['', [Validators.required, Validators.min(1970), Validators.max(new Date().getFullYear())]],
      //ISBN must be 10 or 13 characters long
      ISBN: ['', [Validators.required, isbnLengthValidator()]]

    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  saveBook(): void {
    if (this.bookForm.valid) {
      this.auctionService.addBook(this.bookForm.value).then(newBook => {
        this.dialogRef.close(newBook);
      }).catch(err => {
        this.dialogRef.close(null);
      });
    }
  }
}
