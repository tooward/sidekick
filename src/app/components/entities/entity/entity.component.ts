import { Component, OnInit, Input } from '@angular/core';
import { ENTITY } from '../data/entities';
import { EntitiesService } from '../services/entities.service';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.css']
})

export class EntityComponent implements OnInit {

  @Input() entity: ENTITY;

  constructor(
    public service: EntitiesService
    ) { }

  ngOnInit(): void {
    // console.log("Comment id: " + this.comment.id);
  }

  delete(){
    if (confirm("Are you sure you want to delete this entity?")){
      this.service.delete(this.entity);
    }
  }

}