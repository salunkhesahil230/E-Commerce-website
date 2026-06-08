import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  totalProducts = 0;
  totalCustomers = 0;
  totalOrders = 0;
  loading = true;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.adminService.getProducts().subscribe(res => {
      this.totalProducts = res.total;
    });
    this.adminService.getCustomers().subscribe(customers => {
      this.totalCustomers = customers.length;
    });
    this.adminService.getOrders().subscribe(res => {
      this.totalOrders = res.total;
      this.loading = false;
    });
  }
}