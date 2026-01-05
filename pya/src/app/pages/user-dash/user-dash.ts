import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-dash',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-dash.html'
})
export class UserDashComponent {
  seguroActivo: boolean = true;
  fechaVencimiento: string = '12/12/2026';
  showForm: boolean = false;
  newSiniestro: any = {};

  // Para gestión documental
  public documentosUsuario: any[] = [];
  public authService: AuthService;

  constructor(public firestoreService: FirestoreService, authService: AuthService) {
    this.authService = authService;
  }

  ngOnInit() {
    this.cargarDocumentosUsuario();
  }

  async cargarDocumentosUsuario() {
    try {
      const usuarioUid = localStorage.getItem('uid') || '';
      const rol = this.authService.getRole();
      let docs = [];
      if (rol === 'GESTOR') {
        // GESTOR ve todos los documentos
        docs = await this.firestoreService.getDocuments('documentos');
      } else {
        // CLIENTE ve solo los suyos
        docs = await this.firestoreService.getDocumentsWithCondition('documentos', 'usuario', '==', usuarioUid);
      }
      this.documentosUsuario = docs;
    } catch (error) {
      this.documentosUsuario = [];
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    console.log('Form toggled:', this.showForm);
  }

  async registrarSiniestro() {
    try {
      const usuarioUid = localStorage.getItem('uid') || '';
        await this.firestoreService.registrarSiniestro(this.newSiniestro, usuarioUid);
      this.newSiniestro = {};
      this.showForm = false;
      alert('Siniestro registrado exitosamente');
    } catch (error) {
      console.error('Error registrando siniestro:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Error al registrar el siniestro');
      }
    }
  }
}