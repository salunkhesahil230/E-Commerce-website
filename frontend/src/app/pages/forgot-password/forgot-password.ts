import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {
  step = 1;
  email = '';
  code = '';
  generatedCode = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  errorMsg = '';

  constructor(private authService: AuthService) {}

  requestCode() {
    this.errorMsg = '';
    if (!this.email) {
      this.errorMsg = 'Please enter your email';
      return;
    }
    this.loading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.loading = false;
        this.generatedCode = res.code;
        this.step = 2;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Failed to generate code';
      }
    });
  }

  resetPassword() {
    this.errorMsg = '';
    if (!this.code || !this.newPassword || !this.confirmPassword) {
      this.errorMsg = 'All fields are required';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match';
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters';
      return;
    }
    this.loading = true;
    this.authService.resetPassword({
      email: this.email,
      code: this.code,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.step = 3;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Failed to reset password';
      }
    });
  }
}