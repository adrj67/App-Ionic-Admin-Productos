import { Component, inject, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/providers/modal-controller';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';
import { orderBy, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  products: Product[] = [];
  loading: boolean = false;

  ngOnInit() {
    console.log('home.page.ts')
  }

  // // ============= Cerrar Sesion ================
  // signOut(){
  //   this.firebaseSvc.signOut();
  // }


  user(): User {
    const user = this.utilsSvc.getFromLocalStorage('user');
    console.log('Usuario:', user);
    return user;
  }

  // ============= Ejecuta esta funcion cada vez que el usuario entra a la pagina
  // en este caso refresca los productos
  ionViewWillEnter() {
    this.getProducts();
  }

  // ======= Refresca la lista de Productos si se corta la conexion o deseo actualizar =======
  doRefresh(event) {
    setTimeout(() => {
      this.getProducts();
      event.target.complete();
    }, 1000);
  }

  // ======== Obtener las Ganancias ===========
  getProfits(){
    return this.products.reduce((index, product) => index + product.price * product.soldUnits, 0);
  }

  // ============= ORIGINAL Obtener productos ===========
  getProducts(){
    let path = `users/${this.user().uid}/products` // comilla simple invertida

    this.loading = true;
    // Orden en el que nuestra la lista de productos
    let query = [
      orderBy('soldUnits', 'desc'),
      //where('soldUnits', '>', 4)
    ]

    let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
      next: (res:any) => {
        console.log('Productos obtenidos: ', res);
        this.products = res;
        this.loading = false;
        sub.unsubscribe();
      }, error: (err) => {
        console.log('Error al obtener el producto: ', err);
      }
    });
  }



  //========== Agregar o actualizar producto ==========
  async addUpdateProduct(product?: Product){
    //console.log('Producto a pasar al modal:', product);

    let success = await this.utilsSvc.presentModal({
      component: AddUpdateProductComponent,
      cssClass: 'add-update-modal',
      componentProps: { product } //{ product: product || {} }
    });

    if(success) this.getProducts();
  }

  // ============ Confirmar la eliminacion del producto ===============
  async confirmDeleteProduct(product: Product) {
    this.utilsSvc.presentAlert({
      header: 'Eliminar Producto',
      message: '¿Quieres eliminar este producto?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
        }, {
          text: 'Si, eliminar',
          handler: () => {
            this.deleteProduct(product);
          }
        }
      ]
    });

  }
  
  // ========== Eliminar Producto ========
  async deleteProduct(product: Product) {

    console.log('Eliminando producto:', product);

      let path = `users/${this.user().uid}/products/${product.id}` // comilla simple invertida

      const loading = await this.utilsSvc.loading();
      await loading.present();

      let imagePath = await this.firebaseSvc.getFilePath(product.image);
      await this.firebaseSvc.deleteFile(imagePath);

      this.firebaseSvc.deleteDocument(path).then( async res => {

        this.products = this.products.filter(p => p.id !== product.id);

        this.utilsSvc.presentToast({
          message: 'Producto Eliminado exitosamente',
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
