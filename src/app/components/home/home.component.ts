import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../shared/services/auth.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public isLoggedIn: boolean;

  constructor(
    private authSvc: AuthService
  ) { 

    if (this.authSvc.isLoggedIn) {
      this.isLoggedIn = true;
    }
  }

  ngOnInit(): void {
  }

}
