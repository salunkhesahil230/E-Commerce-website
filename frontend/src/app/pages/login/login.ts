import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    this.errorMsg = '';
    if (!this.email || !this.password) {
      this.errorMsg = 'Please enter email and password';
      return;
    }
    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}