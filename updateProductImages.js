import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from './firebaseConfig.js';

const imagenesProductos = {
"iPhone 15 Pro":"https://nextlevel.com.bo/cdn/shop/files/IPHONE15PROMAX_256_530x@2x.jpg?v=1728942145",
"Teclado Mecánico":"https://marboltec.com/wp-content/uploads/2021/05/K9902-1.jpg",
"Laptop Gaming":"https://m.media-amazon.com/images/I/81Cm1VMdxrL._AC_SL1500_.jpg",
"Auriculares Bluetooth":"https://sony.scene7.com/is/image/sonyglobalsolutions/WH-ULT900N_Primary_image_Black?$mediaCarouselSmall$&fmt=png-alpha",
"Mouse Gamer":"https://sofmat.com.bo/wp-content/uploads/2024/07/Mouse-Gamer-KP-V4.jpg",
"Smartwatch":"https://m.media-amazon.com/images/I/61pIzNaNRWL.jpg",
"Tablet Android":"https://cdn.thewirecutter.com/wp-content/media/2024/12/androidtablets-2048px-00013.jpg?auto=webp&quality=75&width=1024",
"Monitor 4K":"https://hp.widen.net/content/6ukjdba4wt/png/6ukjdba4wt.png?w=800&h=600&dpi=72&color=ffffff00"
};

async function updateProductImages() {
  console.log('🖼️ Actualizando imágenes de productos...');
  
  try {
    const productosCollection = collection(db, 'productos');
    
    for (const [nombreProducto, imagenUrl] of Object.entries(imagenesProductos)) {
      console.log(`📸 Buscando producto: ${nombreProducto}`);
      
      // Buscar producto por nombre
      const q = query(productosCollection, where("nombre", "==", nombreProducto));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Actualizar cada documento encontrado
        const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
          const docRef = doc(db, 'productos', docSnapshot.id);
          await updateDoc(docRef, { 
            imagen: imagenUrl,
            fechaActualizacion: new Date()
          });
          console.log(`✅ Imagen actualizada para: ${nombreProducto}`);
        });
        
        await Promise.all(updatePromises);
      } else {
        console.log(`❌ Producto no encontrado: ${nombreProducto}`);
      }
    }
    
    console.log('🎉 Todas las imágenes han sido actualizadas exitosamente');
  } catch (error) {
    console.error('❌ Error actualizando imágenes:', error);
  }
}

updateProductImages();