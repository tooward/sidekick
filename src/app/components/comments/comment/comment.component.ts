import { Component, OnInit, Input } from '@angular/core';
import { OComment } from '../data/comment';
import { CommentService } from '../services/comments.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})

export class CommentComponent implements OnInit {

  @Input() comment: OComment;

  constructor(    
    public cservice: CommentService
    ) { }

  ngOnInit(): void {
    // console.log("Comment id: " + this.comment.id);
  }

  delete(){
    if (confirm("Are you sure you want to delete this comment?")){
      this.cservice.deleteComment(this.comment);
    }
  }

}
