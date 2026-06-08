import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth';
import { CartService } from '../../services/cart';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  cartCount = 0;
  searchKeyword = '';
  taxonomyTree: any[] = [];
  activeDropdown: string | null = null;

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: MouseEvent) {
  //   const target = event.target as HTMLElement;
  //   if (!target.closest('.dropdown-wrapper')) {
  //     this.activeDropdown = null;
  //   }
  // }

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.role !== 'admin') {
        this.cartService.getCart().subscribe();
      }
    });

    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });

    this.productService.getTaxonomyTree().subscribe(tree => {
      this.taxonomyTree = tree;
    });
  }

  search() {
    if (this.searchKeyword.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { keyword: this.searchKeyword.trim() }
      });
    }
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.search();
    }
  }

  logout() {
    this.authService.logout().subscribe();
  }

  toggleDropdown(name: string) {
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  closeDropdown() {
    this.activeDropdown = null;
  }

  browseType(typeId: number) {
    this.router.navigate(['/search'], { queryParams: { typeId } });
    this.closeDropdown();
  }

  browseCategory(categoryId: number) {
    this.router.navigate(['/search'], { queryParams: { categoryId } });
    this.closeDropdown();
  }

  browseSubCategory(subCategoryId: number) {
    this.router.navigate(['/search'], { queryParams: { subCategoryId } });
    this.closeDropdown();
  }
}