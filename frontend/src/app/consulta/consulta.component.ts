import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConsultaService } from '../services/consulta.service';
import { marked } from 'marked';
import { switchMap } from 'rxjs';
import { delay, of } from 'rxjs';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    AvatarModule,
    ConfirmDialogModule,
  ],
  templateUrl: './consulta.component.html',
  styleUrls: ['./consulta.component.css'],
})
export class ConsultaComponent {
  clienteId = '';
  pregunta = '';
  respuesta: any = null;
  cargando = false;
  historial: Array<{
    texto: string;
    tipo: 'usuario' | 'asistente';
    fuente?: string;
  }> = [];

  clientes = [
    { label: 'E-Global (Simulado)', value: 'e-global' },
    { label: 'Finanzas Corp (Simulado)', value: 'finanzas_corp' },
    { label: 'SaludTech (Simulado)', value: 'saludtech' },
    { label: 'EdukaPro (Simulado)', value: 'edukapro' },
    { label: 'GPT4All (IA real)', value: 'cliente_llm' },
  ];

  faqPorCliente: Record<string, string[]> = {
    'e-global': [
      '¿Qué servicios ofrece la empresa?',
      '¿Puedes proporcionarme su contacto?',
      '¿Qué certificaciones tienen?',
    ],
    finanzas_corp: [
      '¿Cuáles son los productos financieros que ofrecen?',
      '¿Cuál es la tasa de interés para un crédito empresarial?',
      '¿Dónde están ubicadas sus oficinas?',
    ],
    saludtech: [
      '¿Qué soluciones de salud digital ofrecen?',
      '¿Tienen aplicaciones móviles para pacientes?',
      '¿Con qué clínicas tienen convenio?',
    ],
    edukapro: [
      '¿Qué cursos ofrecen?',
      '¿Tienen programas para empresas?',
      '¿Cómo funciona la plataforma de aprendizaje?',
    ],
    cliente_llm: [
      '¿Qué es la arquitectura hexagonal?',
      '¿Qué es un LLM?',
      '¿Para qué sirve FastAPI?',
      '¿Qué es Python?',
      '¿Cómo funciona Angular?',
      '¿Qué es clean architecture?',
    ],
  };

  constructor(
    private consultaService: ConsultaService,
    private confirmService: ConfirmationService
  ) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  ngOnChanges() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    if (!this.clienteId) return;
    const guardado = localStorage.getItem(`historial_${this.clienteId}`);
    this.historial = guardado ? JSON.parse(guardado) : [];
  }

  guardarHistorial() {
    if (!this.clienteId) return;
    localStorage.setItem(
      `historial_${this.clienteId}`,
      JSON.stringify(this.historial)
    );
  }

  eliminarHistorial() {
    if (!this.clienteId) return;
    localStorage.removeItem(`historial_${this.clienteId}`);
    this.historial = [];
  }

  confirmarEliminacionHistorial() {
    this.confirmService.confirm({
      message:
        '¿Estás seguro de que deseas eliminar el historial de este cliente?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'Cancelar',
      rejectButtonStyleClass: 'p-button-text p-button-danger',
      accept: () => {
        this.eliminarHistorial();
      },
    });
  }
  usarPregunta(pregunta: string) {
    this.pregunta = pregunta;
    this.consultar();
  }

  esClienteSimulado(): boolean {
    return this.clienteId !== 'cliente_llm';
  }

  consultar() {
    if (!this.pregunta?.trim() || !this.clienteId) return;

    this.historial.push({ texto: this.pregunta, tipo: 'usuario' });
    this.guardarHistorial();
    const preguntaActual = this.pregunta;
    this.pregunta = '';
    this.cargando = true;

    this.consultaService
      .enviarConsulta({
        cliente_id: this.clienteId,
        pregunta: preguntaActual,
      })
      .pipe(
        switchMap((data) => {
          return this.esClienteSimulado()
            ? of(data).pipe(delay(1000))
            : of(data);
        })
      )
      .subscribe({
        next: (data) => {
          console.log('Response', data);

          this.historial.push({
            texto: marked.parse(data.respuesta) as string,
            tipo: 'asistente',
            fuente: data.documento_fuente,
          });
          this.guardarHistorial();
          this.cargando = false;
        },
        error: (err) => {
          this.historial.push({
            texto: 'Ocurrió un error: ' + err.message,
            tipo: 'asistente',
          });
          this.guardarHistorial();
          this.cargando = false;
        },
      });
  }
}
