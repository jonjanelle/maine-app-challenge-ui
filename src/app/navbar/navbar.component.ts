import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent {
  public menuOpen: boolean = false;

  public menuClasses = "collapse navbar-collapse"

  constructor() {}

  setMenuStatus(isOpen: boolean) {
    this.menuOpen = isOpen;
    if (isOpen) {
      this.menuClasses = "show navbar-collapse"
    } else {
      this.menuClasses = "collapse navbar-collapse"
    }
    console.log("is open: ", this.menuOpen);
  }
}
