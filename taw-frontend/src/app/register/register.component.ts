import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import axios from 'axios';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: FormGroup;
  constructor(private registerFormBuilder: FormBuilder) {
    this.registerForm = this.registerFormBuilder.group({
      name: [''],
      email: [''],
      password: [''],
      confirmPassword: [''],
      role: [''],
    });
  }
  async onSubmit() {
    const res = await axios.post('', this.registerForm.value);
  }
}
