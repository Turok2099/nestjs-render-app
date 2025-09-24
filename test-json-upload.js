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

async function testJsonUpload(token) {
  try {
    console.log("🧪 === TEST DE CREACIÓN SIN IMAGEN (JSON) ===");
    
    const response = await fetch("https://nestjs-render-app.onrender.com/admin/exercises", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ejercicio: "Test JSON Upload",
        grupo: "PECHO",
        categoria: "hipertrofia",
        hipertrofia_series: 4,
        hipertrofia_repeticiones: 10,
        isActive: true,
      }),
    });
    
    console.log("📊 Status:", response.status);
    
    const responseText = await response.text();
    console.log("📋 Respuesta:", responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log("✅ Ejercicio creado sin imagen!");
      console.log("📋 Datos:", {
        id: data.data?.id,
        nombre: data.data?.nombre,
        imagen: data.data?.imagen,
      });
      return { success: true, data: data.data };
    } else {
      console.log("❌ Error en la creación");
      return { success: false, error: responseText };
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    return { success: false, error: error.message };
  }
}

async function runJsonTest() {
  console.log("🧪 === TEST DE CREACIÓN CON JSON ===\n");
  
  const token = await authenticateAdmin();
  if (!token) {
    console.log("❌ No se pudo autenticar. Abortando test.");
    return;
  }
  
  console.log("✅ Autenticación exitosa\n");
  
  const result = await testJsonUpload(token);
  
  console.log("\n" + "=".repeat(50));
  console.log("📋 RESULTADO DEL TEST:");
  console.log(`📝 Creación sin imagen: ${result.success ? "✅ OK" : "❌ FALLO"}`);
  
  if (result.success) {
    console.log("🎉 ¡TEST PASÓ! El sistema funciona correctamente");
    console.log("✅ Los ejercicios se crean sin problemas");
    console.log("✅ El problema está en el procesamiento de FormData");
  } else {
    console.log("❌ TEST FALLÓ");
    console.log("🔍 Error:", result.error);
  }
  console.log("=".repeat(50));
}

runJsonTest().catch(console.error);
