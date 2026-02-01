// Prueba insert manual en frontend
document.getElementById('pruebaInsertBtn')?.addEventListener('click', async () => {
  try {
    // UUID de ejemplo (puede ser generado en frontend con crypto.randomUUID() si quieres)
    const testId = crypto.randomUUID();

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        { id: testId, nombre: 'Prueba Usuario', email: 'prueba@example.com', rol: 'usuario' }
      ]);

    if(error){
      console.error("Error insert prueba:", error.message);
      alert("Error insert prueba: " + error.message);
    } else {
      console.log("Insert prueba OK:", data);
      alert("Insert prueba OK");
    }

  } catch(e){
    console.error("Error catch prueba:", e);
  }
});
