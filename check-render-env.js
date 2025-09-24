const fetch = require("node-fetch");

async function checkRenderEnvironment() {
  console.log("🔍 === VERIFICANDO VARIABLES DE ENTORNO EN RENDER ===\n");
  
  try {
    // Verificar que el servidor esté funcionando
    console.log("🌐 Verificando estado del servidor...");
    const healthResponse = await fetch("https://nestjs-render-app.onrender.com/health");
    
    if (healthResponse.ok) {
      console.log("✅ Servidor funcionando correctamente");
    } else {
      console.log("❌ Servidor no responde correctamente");
      return;
    }
    
    // Intentar autenticación para ver los logs
    console.log("\n🔐 Autenticando para ver logs...");
    const authResponse = await fetch("https://nestjs-render-app.onrender.com/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "jorge.castro.cruz@hotmail.com",
        password: "pompis10",
      }),
    });
    
    if (authResponse.ok) {
      console.log("✅ Autenticación exitosa");
      console.log("💡 Los logs del servidor deberían mostrar las variables de entorno");
      console.log("💡 Busca en los logs de Render:");
      console.log("   - 🔍 [CloudinaryProvider] Verificando variables de entorno...");
      console.log("   - ✅ Presente o ❌ Ausente para cada variable");
    } else {
      console.log("❌ Error en autenticación");
    }
    
    console.log("\n📋 INSTRUCCIONES PARA VERIFICAR EN RENDER:");
    console.log("1. Ve al Dashboard de Render");
    console.log("2. Selecciona tu servicio 'nestjs-render-app'");
    console.log("3. Ve a la pestaña 'Environment'");
    console.log("4. Verifica que estas variables estén presentes:");
    console.log("   - CLOUDINARY_CLOUD_NAME = dqrism0ya");
    console.log("   - CLOUDINARY_API_KEY = 959387386376442");
    console.log("   - CLOUDINARY_API_SECRET = 8rGlsF2-DhLgldV8l9C-vR65Ma0");
    console.log("5. Si faltan, agrégalas y reinicia el servicio");
    console.log("6. Ve a la pestaña 'Logs' para ver los mensajes de configuración");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkRenderEnvironment().catch(console.error);
