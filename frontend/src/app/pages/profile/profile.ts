import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  activeTab = 'profile';
  user: any = null;

  // Profile form
  name = '';
  email = '';
  profileLoading = false;
  profileSuccess = '';
  profileError = '';

  // Password form
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordLoading = false;
  passwordSuccess = '';
  passwordError = '';

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.name = user.name;
        this.email = user.email;
      }
    });
  }

  updateProfile() {
    this.profileError = '';
    this.profileSuccess = '';
    if (!this.name || !this.email) {
      this.profileError = 'Name and email are required';
      return;
    }
    this.profileLoading = true;
    this.authService.updateProfile({ name: this.name, email: this.email }).subscribe({
      next: () => {
        this.profileLoading = false;
        this.profileSuccess = 'Profile updated successfully!';
        setTimeout(() => this.profileSuccess = '', 3000);
      },
      error: (err) => {
        this.profileLoading = false;
        this.profileError = err.error?.message || 'Failed to update profile';
      }
    });
  }

  changePassword() {
    this.passwordError = '';
    this.passwordSuccess = '';
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'All fields are required';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New passwords do not match';
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return;
    }
    this.passwordLoading = true;
    this.authService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordSuccess = 'Password changed successfully!';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => this.passwordSuccess = '', 3000);
      },
      error: (err) => {
        this.passwordLoading = false;
        this.passwordError = err.error?.message || 'Failed to change password';
      }
    });
  }
}