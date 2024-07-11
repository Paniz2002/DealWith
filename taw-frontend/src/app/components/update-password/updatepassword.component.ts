import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../services/popup/notification.service';
import { RegisterComponent } from '../register/register.component';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';

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
  templateUrl: './updatepassword.html',
  styleUrl: '../register/register.component.css',
})
export class UpdatepasswordComponent implements OnInit {
  form!: FormGroup;
  isFormValid!: Boolean;
  id!: string | null;

  constructor(
    private loginFormBuilder: FormBuilder,
    private router: Router,
    private snackBar: NotificationService,
    private localStorage: LocalStorageService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.form = this.loginFormBuilder.group({
      oldPassword: ['', [Validators.required, Validators.minLength(8)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get getPasswordErrors() {
    return RegisterComponent.getPasswordErrors;
  }

  get getPasswordConfirmErrors() {
    return RegisterComponent.getPasswordConfirmErrors;
  }

  onSubmit() {
    if (
      RegisterComponent.getPasswordErrors(this.form) ||
      RegisterComponent.getPasswordConfirmErrors(this.form)
    ) {
      return;
    }
    axios.patch(enviroments.BACKEND_URL + '/api/auth/profile');
  }

  resetForm() {
    this.form.reset({
      username: '',
      password: '',
    });
  }
}
