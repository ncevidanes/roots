async function mapearArquivo() {
    const fileInput = document.getElementById('arquivoRoot');
    const lista = document.getElementById('listaVariaveis');
    
    if (fileInput.files.length === 0) return alert("Selecione um arquivo!");

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const response = await fetch('http://127.0.0.1:8000/mapear', { method: 'POST', body: formData });
        const data = await response.json();
        
        lista.innerHTML = "<h3>Conteúdo do Arquivo:</h3>";
        for (const [tree, branches] of Object.entries(data.estrutura)) {
            let html = `<strong>Árvore: ${tree}</strong><ul>`;
            branches.forEach(b => html += `<li>${b}</li>`);
            html += "</ul>";
            lista.innerHTML += html;
        }
    } catch (error) {
        console.error("Erro ao mapear:", error);
    }
}
