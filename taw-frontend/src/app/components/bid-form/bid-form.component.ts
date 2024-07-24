import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {BidService} from "../../services/bid/bid.service";
import {CommonModule} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {Router} from "@angular/router";

@Component({
  selector: 'app-bid-form',
  templateUrl: './bid-form.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  styleUrls: ['./bid-form.component.css']
})
export class BidFormComponent implements OnInit {
  bidForm!: FormGroup;
  constructor(
    private registerFormBuilder: FormBuilder,
    private router: Router,
    private bidService: BidService
  ) {}

  ngOnInit() {
    this.bidForm = this.registerFormBuilder.group({
      price: ['', [Validators.required, Validators.min(1)]],
      user: ['', Validators.required],
      book: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.bidForm.valid) {
      this.bidService.addBid(this.bidForm.value).subscribe({
        next: (response) => {
          console.log('Bid submitted successfully', response);
          // Reset the form or show a success message
          this.bidForm.reset();
        },
        error: (error) => {
          console.error('Error submitting bid', error);
          // Show an error message
        }
      });
    }
  }

  gePriceErrors(form: FormGroup): string {
    return "";
  }

  getBookErrors(bidForm: FormGroup): string {
    return "";
  }
}
