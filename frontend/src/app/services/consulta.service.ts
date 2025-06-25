import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ConsultaPayload {
  cliente_id: string;
  pregunta: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConsultaService {
  private API_URL = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  enviarConsulta(payload: ConsultaPayload): Observable<any> {
    return this.http.post(`${this.API_URL}/consulta`, payload);
  }
}
