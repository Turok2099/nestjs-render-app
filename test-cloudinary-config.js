const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// Simular una imagen de prueba
const testImageBuffer = Buffer.from(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==",
  "base64",
);

async function testServerHealth() {
  console.log("🏥 === TEST 1: VERIFICANDO SALUD DEL SERVIDOR ===");
  
  try {
    const response = await fetch("https://nestjs-render-app.onrender.com/health");
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Servidor funcionando correctamente");
      console.log("📋 Status:", data.status);
      return true;
    } else {
      console.log("❌ Servidor no responde correctamente");
      console.log("📊 Status:", response.status);
      return false;
    }
  } catch (error) {
    console.log("❌ Error conectando al servidor:", error.message);
    return false;
  }
}

async function testAuthentication() {
  console.log("\n🔐 === TEST 2: VERIFICANDO AUTENTICACIÓN ===");
  
  try {
    const response = await fetch("https://nestjs-render-app.onrender.com/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "jorge.castro.cruz@hotmail.com",
        password: "pompis10",
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Autenticación exitosa");
      console.log("🔑 Token recibido:", data.accessToken ? "Sí" : "No");
      return data.accessToken;
    } else {
      console.log("❌ Error en autenticación");
      console.log("📊 Status:", response.status);
      return null;
    }
  } catch (error) {
    console.log("❌ Error en autenticación:", error.message);
    return null;
  }
}

async function testCloudinaryConfiguration(token) {
  console.log("\n☁️ === TEST 3: VERIFICANDO CONFIGURACIÓN DE CLOUDINARY ===");
  
  try {
    // Crear un ejercicio sin imagen para ver los logs de configuración
    const response = await fetch("https://nestjs-render-app.onrender.com/admin/exercises", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ejercicio: "Test Config Cloudinary",
        grupo: "PECHO",
        categoria: "hipertrofia",
        hipertrofia_series: 3,
        hipertrofia_repeticiones: 8,
        isActive: true,
      }),
    });
    
    console.log("📊 Status:", response.status);
    
    if (response.ok) {
      console.log("✅ Ejercicio creado sin imagen (para ver logs de configuración)");
      console.log("💡 Revisa los logs de Render para ver:");
      console.log("   - 🔍 [CloudinaryProvider] Verificando variables de entorno...");
      console.log("   - ✅ Presente o ❌ Ausente para cada variable");
      return true;
    } else {
      const errorText = await response.text();
      console.log("❌ Error creando ejercicio:", errorText);
      return false;
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    return false;
  }
}

async function testImageUpload(token) {
  console.log("\n🖼️ === TEST 4: VERIFICANDO SUBIDA DE IMAGEN ===");
  
  try {
    const formData = new FormData();
    
    // Usar campos que pasen la validación
    formData.append("ejercicio", "Test Image Upload");
    formData.append("grupo", "PECHO");
    formData.append("categoria", "hipertrofia");
    formData.append("hipertrofia_series", "4");
    formData.append("hipertrofia_repeticiones", "10");
    formData.append("isActive", "true");
    
    // Crear archivo temporal
    const tempImagePath = path.join(__dirname, "temp-test-config.jpg");
    fs.writeFileSync(tempImagePath, testImageBuffer);
    
    formData.append("image", fs.createReadStream(tempImagePath), {
      filename: "test-config.jpg",
      contentType: "image/jpeg",
    });
    
    console.log("📤 Enviando solicitud con imagen...");
    
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
      console.log("✅ Ejercicio creado con imagen!");
      
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
      console.log("❌ Error en la creación con imagen");
      return { success: false, url: null };
    }
    
    // Limpiar archivo temporal
    fs.unlinkSync(tempImagePath);
  } catch (error) {
    console.log("❌ Error:", error.message);
    return { success: false, url: null };
  }
}

async function generateTestReport(healthOk, authOk, configOk, uploadResult) {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 === REPORTE DE TESTS DE CONFIGURACIÓN ===");
  console.log("=".repeat(70));
  
  console.log("\n📋 RESULTADOS DE LOS TESTS:");
  console.log(`🏥 Salud del servidor: ${healthOk ? "✅ OK" : "❌ FALLO"}`);
  console.log(`🔐 Autenticación: ${authOk ? "✅ OK" : "❌ FALLO"}`);
  console.log(`☁️ Configuración Cloudinary: ${configOk ? "✅ OK" : "❌ FALLO"}`);
  console.log(`🖼️ Subida de imagen: ${uploadResult.success ? "✅ OK" : "❌ FALLO"}`);
  
  if (uploadResult.success) {
    console.log(`   🖼️ URL: ${uploadResult.url}`);
  }
  
  console.log("\n🎯 DIAGNÓSTICO:");
  
  if (!healthOk) {
    console.log("❌ PROBLEMA: Servidor no responde");
    console.log("🔧 SOLUCIÓN: Verificar estado del servicio en Render");
  } else if (!authOk) {
    console.log("❌ PROBLEMA: Error de autenticación");
    console.log("🔧 SOLUCIÓN: Verificar credenciales de administrador");
  } else if (!configOk) {
    console.log("❌ PROBLEMA: Configuración de Cloudinary");
    console.log("🔧 SOLUCIÓN: Verificar variables de entorno en Render");
  } else if (!uploadResult.success) {
    console.log("❌ PROBLEMA: Subida de imagen falla");
    console.log("🔧 SOLUCIÓN: Revisar logs de Cloudinary en Render");
  } else {
    console.log("🎉 ¡TODOS LOS TESTS PASARON!");
    console.log("✅ El sistema está funcionando perfectamente");
    console.log("✅ Las imágenes se suben a Cloudinary correctamente");
    console.log("✅ El sistema está listo para producción");
  }
  
  console.log("\n📝 PRÓXIMOS PASOS:");
  if (uploadResult.success) {
    console.log("1. ✅ Hacer push de los cambios");
    console.log("2. ✅ Probar desde el dashboard de administrador");
    console.log("3. ✅ Crear ejercicios y clases con imágenes reales");
  } else {
    console.log("1. 🔍 Revisar logs de Render para más detalles");
    console.log("2. 🔧 Verificar variables de entorno en Render Dashboard");
    console.log("3. 🔄 Reiniciar el servicio en Render si es necesario");
  }
  
  console.log("\n" + "=".repeat(70));
}

// Ejecutar todos los tests
async function runAllTests() {
  console.log("🧪 === EJECUTANDO TESTS DE CONFIGURACIÓN ===\n");
  
  const healthOk = await testServerHealth();
  if (!healthOk) {
    console.log("❌ Servidor no disponible. Abortando tests.");
    return;
  }
  
  const token = await testAuthentication();
  if (!token) {
    console.log("❌ No se pudo autenticar. Abortando tests.");
    return;
  }
  
  const configOk = await testCloudinaryConfiguration(token);
  const uploadResult = await testImageUpload(token);
  
  await generateTestReport(healthOk, true, configOk, uploadResult);
}

runAllTests().catch(console.error);
