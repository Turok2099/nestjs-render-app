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

async function testSimpleUpload(token) {
  try {
    console.log("🧪 === TEST SIMPLE DE SUBIDA DE IMAGEN ===");
    
    const formData = new FormData();
    
    // Usar campos que pasen la validación
    formData.append("ejercicio", "Test Simple Upload");
    formData.append("grupo", "PECHO");
    formData.append("categoria", "hipertrofia");
    formData.append("hipertrofia_series", "4");
    formData.append("hipertrofia_repeticiones", "10");
    formData.append("isActive", "true");
    
    // Crear archivo temporal
    const tempImagePath = path.join(__dirname, "temp-simple-test.jpg");
    fs.writeFileSync(tempImagePath, testImageBuffer);
    
    formData.append("image", fs.createReadStream(tempImagePath), {
      filename: "simple-test.jpg",
      contentType: "image/jpeg",
    });
    
    console.log("📤 Enviando solicitud...");
    
    const response = await fetch("https://nestjs-render-app.onrender.com/admin/exercises", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    console.log("📊 Status:", response.status);
    
    const responseText = await response.text();
    console.log("📋 Respuesta:", responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log("✅ Ejercicio creado!");
      
      if (data.data?.imagen) {
        const isCloudinary = data.data.imagen.includes("cloudinary.com");
        console.log("☁️ ¿Es URL de Cloudinary?", isCloudinary);
        
        if (isCloudinary) {
          console.log("🎉 ¡ÉXITO TOTAL! Cloudinary funciona correctamente");
          console.log("🖼️ URL de la imagen:", data.data.imagen);
          return { success: true, url: data.data.imagen };
        } else {
          console.log("⚠️ Imagen guardada pero no en Cloudinary");
          console.log("🔍 URL:", data.data.imagen);
          return { success: false, url: data.data.imagen };
        }
      } else {
        console.log("❌ No se guardó URL de imagen");
        return { success: false, url: null };
      }
    } else {
      console.log("❌ Error en la creación");
      return { success: false, url: null };
    }
    
    // Limpiar archivo temporal
    fs.unlinkSync(tempImagePath);
  } catch (error) {
    console.log("❌ Error:", error.message);
    return { success: false, url: null };
  }
}

async function runSimpleTest() {
  console.log("🧪 === TEST SIMPLE DE CONFIGURACIÓN ===\n");
  
  const token = await authenticateAdmin();
  if (!token) {
    console.log("❌ No se pudo autenticar. Abortando test.");
    return;
  }
  
  console.log("✅ Autenticación exitosa\n");
  
  const result = await testSimpleUpload(token);
  
  console.log("\n" + "=".repeat(50));
  console.log("📋 RESULTADO DEL TEST:");
  console.log(`🖼️ Subida de imagen: ${result.success ? "✅ OK" : "❌ FALLO"}`);
  
  if (result.success) {
    console.log("🎉 ¡TEST PASÓ! El sistema funciona correctamente");
    console.log("✅ Las imágenes se suben a Cloudinary");
    console.log("✅ El sistema está listo para producción");
  } else {
    console.log("❌ TEST FALLÓ");
    console.log("🔍 Revisar logs de Render para más detalles");
  }
  console.log("=".repeat(50));
}

runSimpleTest().catch(console.error);
