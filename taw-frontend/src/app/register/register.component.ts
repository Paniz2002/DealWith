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
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isFormValid!: Boolean;
  constructor(private registerFormBuilder: FormBuilder) {}
  ngOnInit() {
    this.isFormValid = false;
    this.registerForm = this.registerFormBuilder.group({
      username: ['', Validators.required, Validators.minLength(1)],
      password: ['', Validators.required, Validators.minLength(8)],
      confirmPassword: ['', Validators.required, Validators.minLength(8)],
      role: [''],
    });
  }

  async onSubmit() {
    const url = enviroments.BACKEND_URL + '/api/auth/register';
    const res = await axios.post(url, this.registerForm.value);
    if (res.status !== 200) {
      console.log('Error: ', res.statusText);
    }
  }
}
