import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  product: any = null;
  loading = true;
  adding = false;
  added = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loadProduct(params['id']);
    });
  }

  loadProduct(id: number) {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/']);
      }
    });
  }

  get imageUrl(): string {
    if (this.product?.imagePath) {
      return `http://localhost:3000/ProductImages/${this.product.imagePath}`;
    }
    return 'assets/placeholder.png';
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isCustomer(): boolean {
    const user = this.authService.getCurrentUser();
    return !!user && user.role === 'customer';
  }

  addToCart() {
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
        this.successMsg = 'Product added to cart!';
        setTimeout(() => {
          this.added = false;
          this.successMsg = '';
        }, 3000);
      },
      error: (err) => {
        this.adding = false;
        this.errorMsg = err.error?.message || 'Failed to add to cart';
      }
    });
  }

  goToLogin() {
   this.router.navigate(['/login']);
}

  shareProduct() {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.successMsg = 'Product link copied to clipboard!';
        setTimeout(() => this.successMsg = '', 3000);
      });
    } else {
      this.successMsg = 'Copy this link: ' + url;
    }
  }

  goBack() {
    window.history.back();
  }
}