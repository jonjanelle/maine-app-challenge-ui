import { AppRoutingModule }     from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule }    from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { CatComponent } from './cats/cat.component';
import { HomeComponent } from './home/home.component'; 
import { ResourcesComponent } from './resources/resources.component';
import { EventsComponent } from './events/events.component';
import {MatButtonModule, MatCheckboxModule, MatCardModule, MatRippleModule,
        MatInputModule, MatTabsModule, MatTableModule, MatPaginatorModule, MatIconModule,
        MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule, MatAutocompleteModule,
        MatSortModule} from '@angular/material';
import { AddResourceDialog } from './resources/dialogs/add-resource-dialog';
import { AddEventDialog } from './events/dialogs/add-event-dialog';
import { AppService } from './app.service';

@NgModule({
  declarations: [
    AppComponent,
    CatComponent, 
    FooterComponent, 
    HomeComponent,
    NavbarComponent,
    ResourcesComponent, 
    EventsComponent,
    AddResourceDialog,
    AddEventDialog
  ],
  entryComponents: [AddResourceDialog],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatButtonModule, MatCheckboxModule, MatCardModule, MatPaginatorModule,
    MatRippleModule, MatTabsModule, MatTableModule, MatInputModule, MatIconModule,
    MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule, MatAutocompleteModule, MatSortModule
  ],
  exports: [MatButtonModule, MatCheckboxModule, MatCardModule, MatRippleModule, 
    MatPaginatorModule, MatTabsModule, MatTableModule, MatInputModule, MatIconModule,
    MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule],
  providers: [AppService],
  bootstrap: [NavbarComponent, AppComponent, FooterComponent]
})
export class AppModule { }
