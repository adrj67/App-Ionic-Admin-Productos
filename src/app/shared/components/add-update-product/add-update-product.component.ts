import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-product',
  templateUrl: './add-update-product.component.html',
  styleUrls: ['./add-update-product.component.scss'],
})
export class AddUpdateProductComponent  implements OnInit {

  @Input() product: Product;

   form = new FormGroup({
     id: new FormControl(''),
     image: new FormControl('', [Validators.required]),
     name: new FormControl('', [Validators.required, Validators.minLength(4)]),
     price: new FormControl(null, [Validators.required, Validators.min(0)]),
     soldUnits: new FormControl(null, [Validators.required, Validators.min(0)]),
   });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  user = {} as User;

  ngOnInit() {
    //console.log('Producto recibido en el modal:', this.product);
    //console.log('ID del producto:', this.product.id);

    this.user = this.utilsSvc.getFromLocalStorage('user');
    if(this.product) this.form.setValue(this.product);

  }

  // =============== Tomar o Seleccionar una foto =============
  async takeImage(){
    const dataUrl = (await this.utilsSvc.takePicture('Imagen del Producto')).dataUrl;
    this.form.controls.image.setValue(dataUrl);
  }

  submit() {
    if (this.form.valid){
      if(this.product) {this.updateProduct();  // quitar id??
      } else {
        this.createProduct();
      }
    }
  }

  // ========== Convierte valores de tipo string en la Base de datos a number para poder ordenar  ================
  setNumberInputs(){

    let { soldUnits, price} = this.form.controls;

    if(soldUnits.value) soldUnits.setValue(parseFloat(soldUnits.value));
    if(price.value) price.setValue(parseFloat(price.value));
  }

 // ========== Crear Producto ========
  async createProduct(){

    //console.log('Creando producto:', this.form.value);

      let path = `users/${this.user.uid}/products` // comilla simple invertida

      const loading = await this.utilsSvc.loading();
      await loading.present();

      // ============= Subir la imagen y obtener la url ================
      let dataUrl = this.form.value.image;
      let imagePath = `${this.user.uid}/${Date.now()}`;
      let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
      this.form.controls.image.setValue(imageUrl);

      //console.log('Ruta imagen:', imageUrl);

      delete this.form.value.id;

      this.firebaseSvc.addDocument(path, this.form.value).then( async res => {

        this.utilsSvc.dismissModal({ success: true});

        this.utilsSvc.presentToast({
          message: 'Producto creado exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        })

      }).catch(error => {

        console.log(error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })

      }).finally(() => {

        loading.dismiss();

      })
  }

  // ========== Actualizar Producto ========
  async updateProduct(){

    //console.log('Actualizando producto:', this.form.value);

      let path = `users/${this.user.uid}/products/${this.product.id}` // comilla simple invertida

      const loading = await this.utilsSvc.loading();
      await loading.present();

      // ============= Si cambio la imagen, subir la nueva y obtener la url ================
      if(this.form.value.image !== this.product.image){
        let dataUrl = this.form.value.image;
        let imagePath = await this.firebaseSvc.getFilePath(this.product.image);
        let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
        this.form.controls.image.setValue(imageUrl);
      }


      delete this.form.value.id;

      // const { id, ...productData } = this.form.value;
      // console.log('Datos enviados a Firebase:', productData);

      this.firebaseSvc.updateDocument(path, this.form.value).then( async res => {

        this.utilsSvc.dismissModal({ success: true});

        this.utilsSvc.presentToast({
          message: 'Producto Actualizado exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        })

      }).catch(error => {

        console.log(error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })

      }).finally(() => {

        loading.dismiss();

      })
  }


}
