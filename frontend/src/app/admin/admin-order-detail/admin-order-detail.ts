import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-order-detail.html',
  styleUrl: './admin-order-detail.css'
})
export class AdminOrderDetail implements OnInit {
  order: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loadOrder(params['id']);
    });
  }

  loadOrder(id: number) {
    this.adminService.getOrder(id).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/admin/orders']);
      }
    });
  }

  getImageUrl(product: any): string {
    if (product?.imagePath) return `http://localhost:3000/ProductImages/${product.imagePath}`;
    return '/placeholder.png';
  }

  goBack() {
    this.router.navigate(['/admin/orders']);
  }
}