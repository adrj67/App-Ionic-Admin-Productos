import { Component, inject, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

    firebaseSvc = inject(FirebaseService);
    utilsSvc = inject(UtilsService);

  ngOnInit() {
    console.log('Profile.page')
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }
  
//   // =============== Tomar o Seleccionar una foto =============
//   async takeImage0(){

//     let user = this.user();
//     let path = `users/${user.uid}` // comilla simple invertida

//     const loading = await this.utilsSvc.loading();
//     await loading.present();

    
//     const dataUrl = (await this.utilsSvc.takePicture('Imagen del Perfil')).dataUrl;

//     let imagePath = `${user.uid}/profile`;
//     user.image = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

//     await this.firebaseSvc.setDocument(path, {image: user.image}).then( async res => {

//       this.utilsSvc.saveInLocalStorage('user', user);

//       this.utilsSvc.presentToast({
//         message: 'Imagen actualizada exitosamente',
//         duration: 1500,
//         color: 'success',
//         position: 'middle',
//         icon: 'checkmark-circle-outline'
//       })

//     }).catch(error => {

//       console.log(error);
//       this.utilsSvc.presentToast({
//         message: error.message,
//         duration: 2500,
//         color: 'primary',
//         position: 'middle',
//         icon: 'alert-circle-outline'
//       })

//     }).finally(() => {

//       loading.dismiss();

//     })
// }

 // =============== Tomar o Seleccionar una foto de perfil=============
async takeImage() {
  let user = this.user();
  let path = `users/${user.uid}`; // Ruta del documento

  
  try {
    // Capturar la imagen
    const dataUrl = (await this.utilsSvc.takePicture('Imagen del Perfil')).dataUrl;

    // Mostrar el loading
    const loading = await this.utilsSvc.loading();
    await loading.present();


    // Subir la imagen a Firebase Storage
    let imagePath = `${user.uid}/profile`;
    user.image = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

    // Actualizar el documento en Firestore
    await this.firebaseSvc.setDocument(path, { image: user.image });

    // Guardar el usuario actualizado en el almacenamiento local
    this.utilsSvc.saveInLocalStorage('user', user);
    loading.dismiss();

    // Mostrar notificación de éxito
    await this.utilsSvc.presentToast({
      message: 'Imagen actualizada exitosamente',
      duration: 1500,
      color: 'success',
      position: 'middle',
      icon: 'checkmark-circle-outline',
    });
  } catch (error) {
    // Manejo de errores
    console.error(error);
    await this.utilsSvc.presentToast({
      message: error.message,
      duration: 2500,
      color: 'primary',
      position: 'middle',
      icon: 'alert-circle-outline',
    });
  } finally {
    // Cerrar el loading
    
  }
}

}
