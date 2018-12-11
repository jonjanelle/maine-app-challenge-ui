import { Component } from '@angular/core';
import { CatService } from './cat.service';

@Component({
  selector: 'view-cats',
  templateUrl: './cat.component.html',
  styleUrls: ['./cat.component.css']
})

export class CatComponent {
  public catUri: string;
  
  constructor(private catService: CatService) { }
  
  
  ngOnInit() {
    this.getCat();
  }

  public getCat(): void {
    this.catService.getCat().subscribe(cat => {
        console.log("here", cat);
        this.catUri = cat[0].url;

    });
  }

}

