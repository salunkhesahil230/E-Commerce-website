import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css'
})
export class OrderDetail implements OnInit {
  order: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loadOrder(params['id']);
    });
  }

  loadOrder(id: number) {
    this.loading = true;
    this.orderService.getOrder(id).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/orders']);
      }
    });
  }

  getImageUrl(product: any): string {
    if (product?.imagePath) {
      return `http://localhost:3000/ProductImages/${product.imagePath}`;
    }
    return '/placeholder.png';
  }

  goToOrders() {
    this.router.navigate(['/orders']);
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