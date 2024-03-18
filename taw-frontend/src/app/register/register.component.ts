import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { enviroments } from '../../enviroments/enviroments';
import axios from 'axios';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isFormValid!: Boolean;

  constructor(
    private registerFormBuilder: FormBuilder,
    private responsiveHandler: BreakpointObserver,
    private router: Router,
  ) {}
  ngOnInit() {
    this.isFormValid = false;
    this.registerForm = this.registerFormBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', [Validators.required]],
    });

    this.responsiveHandler
      .observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web])
      .subscribe((size) => {});
  }

  getUsernameErrors() {
    if (this.registerForm.controls['username'].hasError('required')) {
      return 'Username required.';
    }
    if (this.registerForm.controls['username'].hasError('minlength')) {
      return 'Minimum username length is 3 characters.';
    }
    return '';
  }
  getPasswordErrors() {
    if (this.registerForm.controls['password'].hasError('required')) {
      return 'Password required.';
    }
    if (this.registerForm.controls['confirmPassword'].hasError('required')) {
      return 'Confirm password required';
    }
    if (
      this.registerForm.controls['password'].hasError('minlength') ||
      this.registerForm.controls['confirmPassword'].hasError('minlength')
    ) {
      return 'Password length is atleast 8 characters.';
    }
    return '';
  }
  getRoleErrors() {
    if (this.registerForm.controls['role'].hasError('required')) {
      return 'You must select a role.';
    }
    return '';
  }
  async onSubmit() {
    if (this.getPasswordErrors() || this.getUsernameErrors()) {
      return false;
    }

    const url = enviroments.BACKEND_URL + '/api/auth/register';
    const res = await axios.post(url, this.registerForm.value);
    if (res.status !== 200) {
      console.error('Error: ', res.statusText);
      return false;
    }
    return this.router.navigate(['/login']);
  }
  resetForm() {
    this.registerForm.reset({
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
    });
  }
}
