import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {enviroments} from '../../enviroments/enviroments';
import axios from 'axios';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';
import {NotificationService} from '../popup/notification.service';
import {RegisterComponent} from "../register/register.component";

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
  templateUrl: './login.component.html',
   styleUrl: '../register/register.component.css'
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  isFormValid!: Boolean;

  constructor(
    private loginFormBuilder: FormBuilder,
    private router: Router,
    private snackBar: NotificationService,
  ) {
  }

  ngOnInit() {
    this.isFormValid = false;
    this.form = this.loginFormBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get getUsernameErrors() {
    return RegisterComponent.getUsernameErrors;
  }

  get getPasswordErrors() {
    return RegisterComponent.getPasswordErrors;
  }


  async onSubmit() {
    if (
      RegisterComponent.getPasswordErrors(this.form) ||
      RegisterComponent.getUsernameErrors(this.form)
    ) {
      return;
    }
    const url = enviroments.BACKEND_URL + '/api/auth/login';
    try {
      await axios.post(url, this.form.value);
      this.router.navigate(['/dashboard']);
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
    });
  }

}