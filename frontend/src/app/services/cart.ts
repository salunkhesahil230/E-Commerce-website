import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = '/api/cart';
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      tap((cart: any) => {
        const count = cart?.items?.length || 0;
        this.cartCountSubject.next(count);
      })
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { productId, quantity }).pipe(
      tap(() => this.cartCountSubject.next(this.cartCountSubject.value + 1))
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${itemId}`, { quantity });
  }

  removeItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${itemId}`).pipe(
      tap(() => {
        const current = this.cartCountSubject.value;
        this.cartCountSubject.next(Math.max(0, current - 1));
      })
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear`).pipe(
      tap(() => this.cartCountSubject.next(0))
    );
  }

  updateCartCount(count: number) {
    this.cartCountSubject.next(count);
  }
}