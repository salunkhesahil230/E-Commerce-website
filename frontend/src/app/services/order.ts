import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = '/api/orders';

  constructor(private http: HttpClient) {}

  placeOrder(paymentMethod: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/place`, { paymentMethod });
  }

  getMyOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-orders`);
  }

  getOrder(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}