import { Component } from '@angular/core';
//import { FirebaseService } from './services/firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent{
  constructor(){}
}
//================= EN CASO DE NO CERRAR SESION ==============
// export class AppComponent {
//   constructor(private firebaseSvc: FirebaseService) {

//     this.firebaseSvc.getAuth().onAuthStateChanged((auth) => {
//       if (!auth) {
//         localStorage.removeItem('user');
//       } else {
//         // Si no deseas que se mantenga la sesión:
//         this.firebaseSvc.signOut(); // Fuerza el cierre de sesión
//       }
//     });

//   }
// }
