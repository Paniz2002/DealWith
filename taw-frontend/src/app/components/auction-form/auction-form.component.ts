import {Component, NgModule, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuctionService } from '../../services/bid/auction.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import {CommonModule} from "@angular/common";
import {MatFormFieldControl, MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import { EditorModule } from '@tinymce/tinymce-angular';

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
  books: any[] = [];
  courses: any[] = [];
  filteredBooks!: Observable<any[]>;
  filteredCourses!: Observable<any[]>;

  constructor(
    private registerFormBuilder: FormBuilder,
    private router: Router,
    private bidService: AuctionService
  ) {}

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
    this.bidService.getBooks().then(data => this.books = data);
    this.bidService.getCourses().then(data => this.courses = data);

    // Set up filters
    this.filteredBooks = this.auctionForm.controls['book'].valueChanges.pipe(
      startWith(''),
      map(value => this._filterBooks(value))
    );

    this.filteredCourses = this.auctionForm.controls['course'].valueChanges.pipe(
      startWith(''),
      map(value => this._filterCourses(value))
    );
  }

  private _filterBooks(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.books.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  private _filterCourses(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.courses.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  addBook(name: string) {
    this.bidService.addBook(name).then(newBook => {
      if (newBook) {
        this.books.push(newBook);
        this.auctionForm.controls['book'].setValue(newBook.id);
      }
    });
  }

  addCourse(name: string) {
    this.bidService.addCourse(name).then(newCourse => {
      if (newCourse) {
        this.courses.push(newCourse);
        this.auctionForm.controls['course'].setValue(newCourse.id);
      }
    });
  }

  onSubmit(): void {
    if (this.auctionForm.valid) {
      this.bidService.addAuction(this.auctionForm).then(result => {
        if (result) {
          this.router.navigate(['/auctions']); // or wherever you want to navigate after submission
        }
      });
    }
  }


}
