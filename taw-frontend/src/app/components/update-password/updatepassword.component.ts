import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { environments } from '../../../enviroments/environments';
import axios from 'axios';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/popup/notification.service';
import { RegisterComponent } from '../register/register.component';

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
export class UpdatePasswordComponent implements OnInit {
  form!: FormGroup;
  isFormValid!: Boolean;
  id!: string | null;

  constructor(
    private updatePasswordFormBuilder: FormBuilder,
    private router: Router,
    private snackBar: NotificationService,
  ) {}

  ngOnInit() {
    this.form = this.updatePasswordFormBuilder.group({
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
    axios
      .patch(environments.BACKEND_URL + '/api/auth/me', this.form.value)
      .then((res) => {
        if (res.status === 200) {
          return this.router.navigate(['/login']);
        }
        this.snackBar.notify(res.data.message);
        return;
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          this.snackBar.notify(err.response?.data.message);
        }
      });
  }

  resetForm() {
    this.form.reset({
      oldPassword: '',
      password: '',
      confirmPassword: '',
    });
  }
}
