import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { enviroments } from '../../../enviroments/enviroments';
import axios from 'axios';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/popup/notification.service';

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
  form!: FormGroup;
  isFormValid!: Boolean;

  constructor(
    private registerFormBuilder: FormBuilder,
    private router: Router,
    private snackBar: NotificationService,
  ) {}
  ngOnInit() {
    this.isFormValid = false;
    this.form = this.registerFormBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', [Validators.required]],
    });
  }

  get getUsernameErrors() {
    return RegisterComponent.getUsernameErrors;
  }
  static getUsernameErrors(form: FormGroup<any>) {
    if (form.controls['username'].hasError('required')) {
      return 'Username required.';
    }
    if (form.controls['username'].hasError('minlength')) {
      return 'Minimum username length is 3 characters.';
    }
    return '';
  }

  get getPasswordErrors() {
    return RegisterComponent.getPasswordErrors;
  }
  static getPasswordErrors(form: FormGroup<any>) {
    if (form.controls['password'].hasError('required')) {
      return 'Password required.';
    }
    if (form.controls['password'].hasError('minlength')) {
      return 'Password length is atleast 8 characters.';
    }
    return '';
  }
  getPasswordConfirmErrors() {
    if (this.form.controls['confirmPassword'].hasError('required')) {
      return 'Confirm password required';
    }
    if (this.form.controls['confirmPassword'].hasError('minlength')) {
      return 'Confirm password length is atleast 8 characters.';
    }
    return '';
  }

  getRoleErrors() {
    if (this.form.controls['role'].hasError('required')) {
      return 'You must select a role.';
    }
    return '';
  }

  async onSubmit() {
    if (
      this.getRoleErrors() ||
      RegisterComponent.getPasswordErrors(this.form) ||
      this.getPasswordConfirmErrors() ||
      RegisterComponent.getUsernameErrors(this.form)
    ) {
      return;
    }

    const url = enviroments.BACKEND_URL + '/api/auth/register';
    try {
      await axios.post(url, this.form.value);
      this.router.navigate(['/login']);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        this.snackBar.notify(e.response?.data.message);
      }
    }
  }
  resetForm() {
    this.form.reset({
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
    });
  }
}
