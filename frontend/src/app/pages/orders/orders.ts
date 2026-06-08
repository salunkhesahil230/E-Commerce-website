import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  orders: any[] = [];
  loading = true;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  viewOrder(id: number) {
    this.router.navigate(['/orders', id]);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-confirmed';
    }
  }
}