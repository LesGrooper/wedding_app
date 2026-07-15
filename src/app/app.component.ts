import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ToastHostComponent } from './Component/toast-host/toast-host.component';
import { GuestService } from './Services/guest.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastHostComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  constructor(
    private route:ActivatedRoute,
    private guestService:GuestService,
  ) { }

  ngOnInit():void {
    // Resolve the personalized guest (from ?to=) and broadcast it so
    // every section (hero, splash, rsvp) can render the right name.
    this.guestService.initFromRoute(this.route);
  }

}
