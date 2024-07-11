import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  public minimizedSidenav = false;

  constructor() {
    this.minimizedSidenav = this.isSideNavCollapsed(window.innerWidth);
  }

  @HostListener('window:resize', []) toggleSideBar() {
    this.minimizedSidenav = this.isSideNavCollapsed(window.innerWidth);
  }

  private isSideNavCollapsed(windowWidth: number): boolean {
    return windowWidth >= 600 && windowWidth <= 760;
  }
}
