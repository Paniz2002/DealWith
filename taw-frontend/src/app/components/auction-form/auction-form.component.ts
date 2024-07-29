import {Component,  OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuctionService} from '../../services/bid/auction.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {startWith, map} from 'rxjs/operators';
import {CommonModule} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {EditorModule} from '@tinymce/tinymce-angular';
import {BookModalComponent} from "../book-modal/book-modal.component";
import {MatDialog} from "@angular/material/dialog";


interface Book {
  id: string;
  title: string;
  year: number;
  ISBN: string;
}

@Component({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    EditorModule,
    //MatFormFieldControl
  ],
  selector: 'app-auction-form',
  standalone: true,
  styleUrls: ['./auction-form.component.css'],
  templateUrl: './auction-form.component.html'
})


export class AuctionFormComponent implements OnInit {
  auctionForm!: FormGroup;
  books: Book[] = [];
  courses: any[] = [];
  filteredBooks!: Observable<any[]>;
  filteredCourses!: Observable<any[]>;


  constructor(
    private registerFormBuilder: FormBuilder,
    private router: Router,
    private auctionService: AuctionService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.auctionForm = this.registerFormBuilder.group({
      book: ['', Validators.required],
      course: ['', Validators.required],
      description: ['', Validators.required],
      reserve_price: ['', [Validators.required, Validators.min(1)]],
      starting_price: ['', [Validators.required, Validators.min(1)]],
      end_date: ['', Validators.required],
      start_date: ['', Validators.required],
      condition: ['', Validators.required],
      images: ['', Validators.required],
    });

    // Fetch books and courses from the service
    this.auctionService.getBooks('').then(data => this.books = data);
    this.auctionService.getCourses().then(data => this.courses = data);


    // Set up filters
    this.filteredBooks = this.auctionForm.controls['book'].valueChanges.pipe(
      startWith(''),
      map(value => value)
    );
    this.filteredCourses = this.auctionForm.controls['course'].valueChanges.pipe(
      startWith(''),
      map(value => this._filterCourses(value))
    );
  }



  private _filterCourses(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.courses.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  addBook() {
    const dialogRef = this.dialog.open(BookModalComponent, {
      width: '300pt',
      height: '350pt',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.books.push(result);
        this.auctionForm.controls['book'].setValue(result.id);
      }
    });
  }

  addCourse(name: string) {
    this.auctionService.addCourse(name).then(newCourse => {
      if (newCourse) {
        this.courses.push(newCourse);
        this.auctionForm.controls['course'].setValue(newCourse.id);
      }
    });
  }

  onSubmit(): void {
    if (this.auctionForm.valid) {
      this.auctionService.addAuction(this.auctionForm).then(result => {
        if (result) {
          this.router.navigate(['/auctions']); // or wherever you want to navigate after submission
        }
      });
    }
  }


  searchBook() {
    //get the value of the input
    const search = this.auctionForm.controls['book'].value;
    //fetch the books from the service
    this.auctionService.getBooks(search).then((data) => {
      this.books = data
    });
  }

  displayBookTitle(bookId: string): string {
    const book = this.books.find(book => book.id === bookId);
    return book ?  "["+ book.ISBN+"] " +book.title +" ("+ book.year +")" : '';
  }
}
