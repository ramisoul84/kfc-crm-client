import { Component, OnInit } from '@angular/core';
import { Manager } from '../../core/models/manager';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ToastContainer } from "../../shared/toast/toast";

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterOutlet, ToastContainer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit {
  currentManager: Manager | null = null;
  isSidebarCollapsed = false;

  navigationItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Managers',
      icon: 'dashboard',
      route: '/managers'
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.authService.currentManager$.subscribe(manager => {
      console.log(manager);
      this.currentManager = manager;
    });
  }

  get filteredNavItems(): NavItem[] {
    if (!this.currentManager) return [];

    return this.navigationItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(this.currentManager!.role);
    });
  }

  roleLabel(role: string): string {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      regional_manager: 'Regional Manager',
      restaurant_manager: 'Restaurant Manager',
      shift_supervisor: 'Shift Supervisor',
    };
    return labels[role] || role;
  }


  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
