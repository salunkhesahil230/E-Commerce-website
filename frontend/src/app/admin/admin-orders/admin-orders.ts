import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrders implements OnInit {
  orders: any[] = [];
  loading = true;
  total = 0;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(page = 1) {
    this.loading = true;
    this.adminService.getOrders(page).subscribe({
      next: (res) => {
        this.orders = res.orders;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.currentPage = page;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  viewOrder(id: number) {
    this.router.navigate(['/admin/orders', id]);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadOrders(page);
    }
  }
}