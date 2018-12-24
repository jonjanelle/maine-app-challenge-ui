import { Component, HostListener } from '@angular/core';
import { AppService } from '../app.service';
@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {
  public title = 'maine-app-challenge-ui';
  public isMobile: boolean;

  constructor(
    public appService: AppService
  ) { 
  }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = event.target.innerWidth <= 768;
  }


}
 