import { Component } from '@angular/core';
import { AppService } from '../app.service';
@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {
  public title = 'maine-app-challenge-ui';
  public readonly isMobile: boolean;

  constructor(
    public appService: AppService
  ) { 
    this.isMobile = this.appService.isMobile();
  }
}
 