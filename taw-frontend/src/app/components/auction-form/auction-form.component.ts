import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuctionService} from "../../services/bid/auction.service";
import {CommonModule} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {Router} from "@angular/router";

@Component({
  selector: 'app-auction-form',
  templateUrl: './auction-form.component.html',
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
  styleUrls: ['./auction-form.component.css']
})
export class AuctionFormComponent implements OnInit {
  auctionForm!: FormGroup;
  constructor(
    private registerFormBuilder: FormBuilder,
    private router: Router,
    private bidService: AuctionService
  ) {}

  ngOnInit() {
    this.auctionForm = this.registerFormBuilder.group({
      book: ['', Validators.required],
      course: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      user: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.auctionForm.valid) {
      this.bidService.addAuction(this.auctionForm);
    }
  }

  gePriceErrors(form: FormGroup): string {
    return "";
  }

  getBookErrors(bidForm: FormGroup): string {
    return "";
  }
}
