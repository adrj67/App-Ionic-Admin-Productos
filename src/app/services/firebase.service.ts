import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail} from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, addDoc, collection, collectionData, query, updateDoc, deleteDoc} from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { getStorage, uploadString, ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  storage = inject(AngularFireStorage);
  utilsSvc = inject(UtilsService);

  //======== Autenticacion =================================
  getAuth(){
    console.log("getAuth en firebase.service")
    return getAuth();
  }

  //========== Acceder ==========
  signIn(user: User){
    console.log("signIn en firebase.service")
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  //========== Crear usuario ==========
  signUp(user: User){
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  //========== Actualizar Usuario ==========
  updateUser(displayName: string){
    return updateProfile(getAuth(). currentUser, {displayName});
  }

   //========== Enviar email para restablecer contraseña ==========
   sendRecoveryEmail(email: string){
    return sendPasswordResetEmail(getAuth(), email);
   }

   //========== Cerrar Sesion ==========
   signOut(){
    console.log("Sesión cerrada" )
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsSvc.routerLink('/auth')
   }



  //======== Base de Datos =================================

  // =========== Obtener documentos de una coleccion =================
  getCollectionData(path: string, collectionQuery?: any){
    const ref = collection(getFirestore(), path);
    return collectionData(query(ref, ...collectionQuery), {idField: 'id'});
  } 

  // ======= Setear un documento (guardar datos del usuario en BD)========
  setDocument(path: string, data: any){
    return setDoc (doc(getFirestore(), path), data);
  }

  // ======= Actualizar un documento (guardar datos del usuario en BD)========
  updateDocument(path: string, data: any){
    return updateDoc (doc(getFirestore(), path), data);
  }

   // ======= Eliminar un documento (producto)========
   deleteDocument(path: string){
    return deleteDoc (doc(getFirestore(), path));
  }

  // ======= Obtener un documento (guardar datos del usuario en BD)========
  async getDocument(path: string){
    return (await getDoc (doc(getFirestore(), path))).data();
  }

  // ======== Agregar un Documento =======
  addDocument(path: string, data: any){
    return addDoc (collection(getFirestore(), path), data);
  }

  // ===================== Almacenamiento ======================

  // =========== Subir una Imagen =================
  async uploadImage(path: string, data_url: string){
    return uploadString (ref(getStorage(), path), data_url, 'data_url').then(() => {
      return getDownloadURL(ref(getStorage(), path));
    })
  }

  // =========== Obtener ruta de la imagen con su url ===========
  async getFilePath(url: string){
    console.log(url)
    return ref(getStorage(), url).fullPath;
  }

  // =========== Eliminar archivo =========
  deleteFile(path: string){
    return deleteObject(ref(getStorage(), path));
  }

}
