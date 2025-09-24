const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// Simular una imagen de prueba
const testImageBuffer = Buffer.from(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==",
  "base64",
);

async function authenticateAdmin() {
  try {
    const authUrl = "https://nestjs-render-app.onrender.com/auth/login";
    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "jorge.castro.cruz@hotmail.com",
        password: "pompis10",
      }),
    });

    if (!response.ok) {
      throw new Error("Error de autenticación");
    }

    const authData = await response.json();
    return authData.accessToken;
  } catch (error) {
    console.error("❌ Error en autenticación:", error.message);
    return null;
  }
}

async function uploadSimpleExercise(token, exerciseName) {
  try {
    console.log(`🏋️ Subiendo ejercicio: ${exerciseName}`);
    
    const formData = new FormData();
    
    // Usar campos que pasen la validación
    formData.append("ejercicio", exerciseName);
    formData.append("grupo", "PECHO");
    formData.append("categoria", "hipertrofia");
    formData.append("hipertrofia_series", "4");
    formData.append("hipertrofia_repeticiones", "10");
    formData.append("isActive", "true");
    
    // Crear archivo temporal
    const tempImagePath = path.join(__dirname, `temp-${exerciseName.replace(/\s+/g, '-')}.jpg`);
    fs.writeFileSync(tempImagePath, testImageBuffer);
    
    formData.append("image", fs.createReadStream(tempImagePath), {
      filename: `${exerciseName.replace(/\s+/g, '-')}.jpg`,
      contentType: "image/jpeg",
    });
    
    console.log(`📤 Enviando solicitud con imagen...`);
    
    const response = await fetch("https://nestjs-render-app.onrender.com/admin/exercises", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`📋 Respuesta: ${responseText}`);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log(`✅ Ejercicio creado: ${exerciseName}`);
      
      if (data.data?.imagen) {
        const isCloudinary = data.data.imagen.includes("cloudinary.com");
        console.log(`☁️ ¿Es URL de Cloudinary? ${isCloudinary ? "✅ SÍ" : "❌ NO"}`);
        
        if (isCloudinary) {
          console.log(`🖼️ URL de la imagen: ${data.data.imagen}`);
          return { success: true, url: data.data.imagen, exerciseId: data.data.id };
        } else {
          console.log(`⚠️ Imagen guardada pero no en Cloudinary: ${data.data.imagen}`);
          return { success: false, url: data.data.imagen, exerciseId: data.data.id };
        }
      } else {
        console.log(`❌ No se guardó URL de imagen para ${exerciseName}`);
        return { success: false, url: null, exerciseId: data.data?.id };
      }
    } else {
      console.log(`❌ Error creando ejercicio ${exerciseName}: ${responseText}`);
      return { success: false, url: null, exerciseId: null };
    }
    
    // Limpiar archivo temporal
    fs.unlinkSync(tempImagePath);
  } catch (error) {
    console.log(`❌ Error subiendo ${exerciseName}:`, error.message);
    return { success: false, url: null, exerciseId: null };
  }
}

async function uploadSimpleClass(token, className) {
  try {
    console.log(`🎓 Subiendo clase: ${className}`);
    
    const formData = new FormData();
    
    // Usar campos que pasen la validación
    formData.append("title", className);
    formData.append("date", "2025-01-25");
    formData.append("startTime", "08:00");
    formData.append("endTime", "09:00");
    formData.append("capacity", "20");
    formData.append("location", "Sala Principal");
    formData.append("description", `Clase de prueba: ${className}`);
    formData.append("isActive", "true");
    
    // Crear archivo temporal
    const tempImagePath = path.join(__dirname, `temp-class-${className.replace(/\s+/g, '-')}.jpg`);
    fs.writeFileSync(tempImagePath, testImageBuffer);
    
    formData.append("image", fs.createReadStream(tempImagePath), {
      filename: `class-${className.replace(/\s+/g, '-')}.jpg`,
      contentType: "image/jpeg",
    });
    
    console.log(`📤 Enviando solicitud con imagen...`);
    
    const response = await fetch("https://nestjs-render-app.onrender.com/classes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`📋 Respuesta: ${responseText}`);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log(`✅ Clase creada: ${className}`);
      
      if (data.data?.image_url) {
        const isCloudinary = data.data.image_url.includes("cloudinary.com");
        console.log(`☁️ ¿Es URL de Cloudinary? ${isCloudinary ? "✅ SÍ" : "❌ NO"}`);
        
        if (isCloudinary) {
          console.log(`🖼️ URL de la imagen: ${data.data.image_url}`);
          return { success: true, url: data.data.image_url, classId: data.data.id };
        } else {
          console.log(`⚠️ Imagen guardada pero no en Cloudinary: ${data.data.image_url}`);
          return { success: false, url: data.data.image_url, classId: data.data.id };
        }
      } else {
        console.log(`❌ No se guardó URL de imagen para ${className}`);
        return { success: false, url: null, classId: data.data?.id };
      }
    } else {
      console.log(`❌ Error creando clase ${className}: ${responseText}`);
      return { success: false, url: null, classId: null };
    }
    
    // Limpiar archivo temporal
    fs.unlinkSync(tempImagePath);
  } catch (error) {
    console.log(`❌ Error subiendo ${className}:`, error.message);
    return { success: false, url: null, classId: null };
  }
}

async function runSimpleImagesTest() {
  console.log("🧪 === TEST SIMPLE DE SUBIDA DE IMÁGENES ===\n");
  
  const token = await authenticateAdmin();
  if (!token) {
    console.log("❌ No se pudo autenticar. Abortando test.");
    return;
  }
  
  console.log("✅ Autenticación exitosa\n");
  
  // Subir primer ejercicio con imagen
  console.log("🏋️ === SUBIENDO PRIMER EJERCICIO ===");
  const exercise1 = await uploadSimpleExercise(token, "Test Exercise 1");
  
  console.log("\n🎓 === SUBIENDO PRIMERA CLASE ===");
  const class1 = await uploadSimpleClass(token, "Test Class 1");
  
  console.log("\n🏋️ === SUBIENDO SEGUNDO EJERCICIO ===");
  const exercise2 = await uploadSimpleExercise(token, "Test Exercise 2");
  
  console.log("\n🎓 === SUBIENDO SEGUNDA CLASE ===");
  const class2 = await uploadSimpleClass(token, "Test Class 2");
  
  // Generar reporte final
  console.log("\n" + "=".repeat(70));
  console.log("📋 === REPORTE FINAL DE SUBIDA DE IMÁGENES ===");
  console.log("=".repeat(70));
  
  console.log("\n🏋️ RESULTADOS DE EJERCICIOS:");
  console.log(`Ejercicio 1: ${exercise1.success ? "✅ ÉXITO" : "❌ FALLO"}`);
  if (exercise1.success) {
    console.log(`   🖼️ URL: ${exercise1.url}`);
    console.log(`   🆔 ID: ${exercise1.exerciseId}`);
  }
  
  console.log(`Ejercicio 2: ${exercise2.success ? "✅ ÉXITO" : "❌ FALLO"}`);
  if (exercise2.success) {
    console.log(`   🖼️ URL: ${exercise2.url}`);
    console.log(`   🆔 ID: ${exercise2.exerciseId}`);
  }
  
  console.log("\n🎓 RESULTADOS DE CLASES:");
  console.log(`Clase 1: ${class1.success ? "✅ ÉXITO" : "❌ FALLO"}`);
  if (class1.success) {
    console.log(`   🖼️ URL: ${class1.url}`);
    console.log(`   🆔 ID: ${class1.classId}`);
  }
  
  console.log(`Clase 2: ${class2.success ? "✅ ÉXITO" : "❌ FALLO"}`);
  if (class2.success) {
    console.log(`   🖼️ URL: ${class2.url}`);
    console.log(`   🆔 ID: ${class2.classId}`);
  }
  
  const totalSuccess = [exercise1, exercise2, class1, class2].filter(r => r.success).length;
  const totalTests = 4;
  
  console.log(`\n📊 RESUMEN: ${totalSuccess}/${totalTests} pruebas exitosas`);
  
  if (totalSuccess === totalTests) {
    console.log("\n🎉 ¡TODAS LAS PRUEBAS PASARON!");
    console.log("✅ Las imágenes se suben a Cloudinary correctamente");
    console.log("✅ El sistema funciona para ejercicios y clases");
    console.log("✅ El sistema está listo para producción");
    console.log("✅ Se puede proceder con el push");
  } else if (totalSuccess > 0) {
    console.log("\n⚠️ ALGUNAS PRUEBAS FALLARON");
    console.log("🔍 Revisar logs de Render para más detalles");
    console.log("🔧 Verificar variables de entorno de Cloudinary");
  } else {
    console.log("\n❌ TODAS LAS PRUEBAS FALLARON");
    console.log("🔍 Revisar configuración de Cloudinary");
    console.log("🔧 Verificar variables de entorno en Render");
  }
  
  console.log("\n" + "=".repeat(70));
}

runSimpleImagesTest().catch(console.error);
