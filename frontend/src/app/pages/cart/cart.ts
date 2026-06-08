import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  cart: any = null;
  loading = true;
  placingOrder = false;
  errorMsg = '';
  showCheckout = false;
  selectedPayment = '';

  paymentMethods = [
    'Credit Card',
    'Debit Card',
    'Cash on Delivery',
    'Bank Transfer'
  ];

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get cartItems() {
    return this.cart?.items || [];
  }

  get totalAmount() {
    return this.cartItems.reduce((sum: number, item: any) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  }

  get totalItems() {
    return this.cartItems.reduce((sum: number, item: any) => {
      return sum + item.quantity;
    }, 0);
  }

  getImageUrl(product: any): string {
    if (product?.imagePath) {
      return `http://localhost:3000/ProductImages/${product.imagePath}`;
    }
    return '/placeholder.png';
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  updateQuantity(itemId: number, quantity: number) {
    if (quantity < 1) return;
    this.cartService.updateQuantity(itemId, quantity).subscribe({
      next: () => this.loadCart(),
      error: (err) => this.errorMsg = err.error?.message || 'Failed to update'
    });
  }

  removeItem(itemId: number) {
    this.cartService.removeItem(itemId).subscribe({
      next: () => this.loadCart(),
      error: (err) => this.errorMsg = err.error?.message || 'Failed to remove'
    });
  }

  proceedToCheckout() {
    this.showCheckout = true;
    this.errorMsg = '';
  }

  placeOrder() {
    if (!this.selectedPayment) {
      this.errorMsg = 'Please select a payment method';
      return;
    }
    this.placingOrder = true;
    this.errorMsg = '';
    this.orderService.placeOrder(this.selectedPayment).subscribe({
      next: (res) => {
        this.placingOrder = false;
        this.router.navigate(['/orders', res.order.id]);
      },
      error: (err) => {
        this.placingOrder = false;
        this.errorMsg = err.error?.message || 'Failed to place order';
      }
    });
  }
}