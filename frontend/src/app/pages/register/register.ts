import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMsg = 'All fields are required';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match';
      return;
    }
    if (this.password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;
    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'Registration successful! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}