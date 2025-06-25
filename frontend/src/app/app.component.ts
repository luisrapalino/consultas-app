import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConsultaComponent } from './consulta/consulta.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, ConsultaComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'consulta-ai-frontend';
}
