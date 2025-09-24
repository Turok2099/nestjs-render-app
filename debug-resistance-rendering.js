// Script para debuggear por qué no se renderizan los ejercicios de resistencia

// Configuración
const API_BASE_URL = "https://nestjs-render-app.onrender.com";

// Función para obtener ejercicios desde endpoint público
async function getExercisesPublic() {
  try {
    console.log("📋 Obteniendo ejercicios desde endpoint público...");

    const response = await fetch(`${API_BASE_URL}/exercises`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo ejercicios: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("❌ Error obteniendo ejercicios:", error.message);
    throw error;
  }
}

// Función principal
async function debugResistanceRendering() {
  try {
    console.log("🚀 === DEBUGGING RENDERIZADO DE RESISTENCIA ===\n");

    // 1. Obtener todos los ejercicios
    const allExercises = await getExercisesPublic();
    console.log(`📊 Total ejercicios obtenidos: ${allExercises.length}`);

    // 2. Filtrar ejercicios de resistencia
    const resistanceExercises = allExercises.filter(
      ex => ex.categoria && ex.categoria.toLowerCase() === "resistencia"
    );

    console.log(`\n🏋️ Ejercicios de resistencia encontrados: ${resistanceExercises.length}`);

    // 3. Mostrar detalles de cada ejercicio de resistencia
    resistanceExercises.forEach((exercise, index) => {
      console.log(`\n${index + 1}. ${exercise.ejercicio}`);
      console.log(`   - ID: ${exercise.id}`);
      console.log(`   - Categoría: "${exercise.categoria}"`);
      console.log(`   - Tiempo: ${exercise.tiempo}`);
      console.log(`   - Imagen: ${exercise.imagenEjercicio}`);
      console.log(`   - Resistencia Repeticiones: ${exercise.resistencia?.repeticiones}`);
    });

    // 4. Verificar el ejercicio de prueba específicamente
    const testExercise = resistanceExercises.find(ex => ex.ejercicio === "prueba");
    
    console.log("\n" + "=".repeat(80));
    console.log("🔍 === ANÁLISIS DEL EJERCICIO DE PRUEBA ===");
    console.log("=".repeat(80));

    if (testExercise) {
      console.log("✅ Ejercicio 'prueba' encontrado en endpoint público");
      console.log(`   - Categoría: "${testExercise.categoría}"`);
      console.log(`   - Tiempo: ${testExercise.tiempo}`);
      console.log(`   - Imagen: ${testExercise.imagenEjercicio}`);
      
      // Verificar si tiene imagen de Cloudinary
      if (testExercise.imagenEjercicio && testExercise.imagenEjercicio.includes('cloudinary.com')) {
        console.log("✅ Tiene imagen de Cloudinary");
      } else {
        console.log("❌ NO tiene imagen de Cloudinary");
      }
      
      // Verificar si el tiempo está presente
      if (testExercise.tiempo) {
        console.log("✅ Tiene campo tiempo");
      } else {
        console.log("❌ NO tiene campo tiempo");
      }
    } else {
      console.log("❌ Ejercicio 'prueba' NO encontrado en endpoint público");
    }

    // 5. Verificar categorías únicas
    console.log("\n" + "=".repeat(80));
    console.log("🔍 === ANÁLISIS DE CATEGORÍAS ===");
    console.log("=".repeat(80));

    const uniqueCategories = [...new Set(allExercises.map(ex => ex.categoria))];
    console.log("📋 Categorías únicas encontradas:");
    uniqueCategories.forEach(cat => {
      const count = allExercises.filter(ex => ex.categoria === cat).length;
      console.log(`   - "${cat}": ${count} ejercicios`);
    });

    // 6. Verificar si hay ejercicios con categoría "Resistencia" (mayúscula)
    const resistenciaMayuscula = allExercises.filter(ex => ex.categoria === "Resistencia");
    const resistenciaMinuscula = allExercises.filter(ex => ex.categoria === "resistencia");

    console.log(`\n📊 Ejercicios con categoría "Resistencia" (mayúscula): ${resistenciaMayuscula.length}`);
    console.log(`📊 Ejercicios con categoría "resistencia" (minúscula): ${resistenciaMinuscula.length}`);

    if (resistenciaMayuscula.length > 0) {
      console.log("⚠️ PROBLEMA: Hay ejercicios con categoría en mayúscula");
      resistenciaMayuscula.forEach(ex => {
        console.log(`   - ${ex.ejercicio}: "${ex.categoria}"`);
      });
    }

    // 7. Diagnóstico final
    console.log("\n" + "=".repeat(80));
    console.log("📊 === DIAGNÓSTICO FINAL ===");
    console.log("=".repeat(80));

    if (resistanceExercises.length === 0) {
      console.log("❌ PROBLEMA: No se encontraron ejercicios de resistencia");
      console.log("🔧 SOLUCIÓN: Verificar que el deploy haya terminado");
    } else if (testExercise && testExercise.imagenEjercicio && testExercise.imagenEjercicio.includes('cloudinary.com')) {
      console.log("✅ El ejercicio de prueba está correcto");
      console.log("🔍 PROBLEMA: El frontend no está renderizando correctamente");
      console.log("🔧 SOLUCIÓN: Verificar caché del navegador o lógica del frontend");
    } else {
      console.log("❌ PROBLEMA: El ejercicio de prueba no está completo");
      console.log("🔧 SOLUCIÓN: Verificar datos en la base de datos");
    }

  } catch (error) {
    console.error("❌ Error en el proceso principal:", error.message);
    process.exit(1);
  }
}

// Ejecutar el proceso
debugResistanceRendering().catch(console.error);
