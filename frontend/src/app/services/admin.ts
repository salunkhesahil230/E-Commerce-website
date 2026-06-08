import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  // Taxonomy
  addType(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/types`, { name });
  }

  addCategory(name: string, typeId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, { name, typeId });
  }

  addSubCategory(name: string, categoryId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/subcategories`, { name, categoryId });
  }

  // Products
  getProducts(page = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/products?page=${page}`);
  }

  addProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, formData);
  }

  updateProduct(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${id}`, formData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  // Customers
  getCustomers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers`);
  }

  lockCustomer(id: number, isLocked: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/customers/${id}/lock`, { isLocked });
  }

  // Orders
  getOrders(page = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders?page=${page}`);
  }

  getOrder(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${id}`);
  }
}