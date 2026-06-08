import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css']
})
export class ProductCardComponent {
  @Input() product: any;
  adding = false;
  added = false;
  errorMsg = '';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) { }

  get imageUrl(): string {
    if (this.product?.imagePath) {
      return `http://localhost:3000/ProductImages/${this.product.imagePath}`;
    }
    return 'placeholder.png';
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isCustomer(): boolean {
    const user = this.authService.getCurrentUser();
    return !!user && user.role === 'customer';
  }

  get discountedPrice(): number {
    return Math.floor(this.product.price * 0.85);
  }

  get discount(): number {
    return 15;
  }

  goToProduct() {
    this.router.navigate(['/product', this.product.id]);
  }

  goToLogin(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/login']);
  }

  addToCart(event: Event) {
    event.stopPropagation();
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.adding = true;
    this.errorMsg = '';
    this.cartService.addToCart(this.product.id, 1).subscribe({
      next: () => {
        this.adding = false;
        this.added = true;
        setTimeout(() => this.added = false, 2000);
      },
      error: (err) => {
        this.adding = false;
        this.errorMsg = err.error?.message || 'Failed to add';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    });
  }
}