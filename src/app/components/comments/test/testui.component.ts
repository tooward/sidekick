// this had three /'s
// <reference types = '@types/faker' />
import { Component, OnInit } from '@angular/core';
import { testDataService } from './testdata.service';
import { testUserData } from './testUserComments';

@Component({
  selector: 'app-testui',
  templateUrl: './testui.component.html',
  styleUrls: ['./testui.component.css']
})

export class TestuiComponent implements OnInit {

  public testUsersComments: Array<testUserData> = new Array<testUserData>();
  constructor( public tds: testDataService ) { }

  ngOnInit(): void { }

  loadTestData(){
    this.tds.createTestUserAndData(12, true)
            .then(userandcomments => this.testUsersComments.push(userandcomments))
            .catch(error => console.log("Error in creating test users: " + error.message));
  }
}