import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getProducts(page = 1, limit = 12): Observable<any> {
    return this.http.get(`${this.apiUrl}/products?page=${page}&limit=${limit}`);
  }

  getProduct(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${id}`);
  }

  searchProducts(filters: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get(`${this.apiUrl}/products/search`, { params });
  }

  getBySubCategory(subCategoryId: number, page = 1, filters: any = {}): Observable<any> {
    let params = new HttpParams().set('page', page);
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get(`${this.apiUrl}/products/browse/subcategory/${subCategoryId}`, { params });
  }

  getByCategory(categoryId: number, page = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/browse/category/${categoryId}?page=${page}`);
  }

  getByType(typeId: number, page = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/browse/type/${typeId}?page=${page}`);
  }

  getTaxonomyTree(): Observable<any> {
    return this.http.get(`${this.apiUrl}/taxonomy/tree`);
  }

  getTypes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/taxonomy/types`);
  }

  getCategories(typeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/taxonomy/categories/${typeId}`);
  }

  getSubCategories(categoryId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/taxonomy/subcategories/${categoryId}`);
  }
}