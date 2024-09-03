import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { environments } from '../../../environments/environments';
import axios from 'axios';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/popup/notification.service';
import { HeaderHeightService } from '../../services/header/header-height.service';

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
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  isFormValid!: Boolean;
  isUserModerator: Boolean = false;
  registerHeight: string = '100vh';

  constructor(
    private registerFormBuilder: FormBuilder,
    private router: Router,
    private snackBar: NotificationService,
    private headerHeightService: HeaderHeightService,
  ) {
    //check if current route is /register
    if (this.router.url !== '/register') {
      axios
        .get(environments.BACKEND_URL + '/api/auth/me')
        .then((res) => {
          this.isUserModerator = res.data.is_moderator;
        })
        .catch(() => {});
    }
  }

  ngOnInit() {
    this.headerHeightService.headerHeight$.subscribe((height) => {
      this.registerHeight = `calc(100vh - ${height}px)`;
    });
    this.isFormValid = false;
    this.form = this.registerFormBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: [
        '',
        [Validators.required, Validators.minLength(8), Validators.email],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
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

  get getEmailErrors() {
    return RegisterComponent.getEmailErrors;
  }

  static getEmailErrors(form: FormGroup<any>) {
    if (form.controls['email'].hasError('required')) {
      return 'Email required.';
    }
    if (form.controls['email'].hasError('email')) {
      return 'Email format not valid.';
    }
    if (form.controls['email'].hasError('minlength')) {
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
      return 'Password length is at least 8 characters.';
    }
    return '';
  }

  get getPasswordConfirmErrors() {
    return RegisterComponent.getPasswordConfirmErrors;
  }

  static getPasswordConfirmErrors(form: FormGroup<any>) {
    if (form.controls['confirmPassword'].hasError('required')) {
      return 'Confirm password required.';
    }
    if (form.controls['confirmPassword'].hasError('minlength')) {
      return 'Confirm password length is at least 8 characters.';
    }
    return '';
  }

  get getNameError() {
    return RegisterComponent.getNameError;
  }

  static getNameError(form: FormGroup<any>) {
    if (form.controls['name'].hasError('required')) {
      return 'You must write your name.';
    }
    if (form.controls['name'].hasError('minlength')) {
      return 'Name minimum length is 2 characters.';
    }
    return '';
  }

  static getSurnameError(form: FormGroup<any>) {
    if (form.controls['surname'].hasError('required')) {
      return 'You must write your surname.';
    }
    if (form.controls['surname'].hasError('minlength')) {
      return 'Surname minimum length is 2 characters.';
    }
    return '';
  }

  get getSurnameError() {
    return RegisterComponent.getSurnameError;
  }

  async onSubmit() {
    if (
      RegisterComponent.getPasswordErrors(this.form) ||
      RegisterComponent.getPasswordConfirmErrors(this.form) ||
      RegisterComponent.getUsernameErrors(this.form)
    ) {
      return;
    }
    const url = environments.BACKEND_URL + '/api/auth/register';
    try {
      if (this.isUserModerator) {
        this.form.value.role = 'moderator';
      } else {
        this.form.value.role = 'student';
      }
      await axios.post(url, this.form.value);
      this.snackBar.notify('User registered successfully.');
      if (this.isUserModerator) {
        this.resetForm();
      } else {
        await this.router.navigate(['/login']);
      }
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
    });
  }
}
