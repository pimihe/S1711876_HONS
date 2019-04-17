import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public queryString;

  @Output() toggleSideNav: EventEmitter<any> = new EventEmitter();

  constructor(
    public AuthService: AuthService
  ) { }

  ngOnInit() {}

}
