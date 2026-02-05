async function explorarArquivo() {
    const fileInput = document.getElementById('arquivoRoot');
    const display = document.getElementById('resultado');
    
    if (fileInput.files.length === 0) {
        alert("Por favor, selecione um arquivo .root");
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    display.innerHTML = "<p class='loading'>🔍 Explorando conteúdo total... aguarde.</p>";

    try {
        const response = await fetch('http://127.0.0.1:8000/mapear', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.status === "erro") {
            display.innerHTML = `<p style="color:red">Erro: ${data.detalhes}</p>`;
            return;
        }

        // Limpa e inicia a construção da visualização
        display.innerHTML = `<h2>Arquivo: ${data.filename}</h2>`;

        for (const [treeName, branches] of Object.entries(data.estrutura)) {
            const section = document.createElement('div');
            section.className = 'tree-card';
            
            section.innerHTML = `
                <h3>🌳 Árvore: ${treeName}</h3>
                <p><strong>${branches.length}</strong> variáveis encontradas:</p>
                <div class="branch-grid">
                    ${branches.map(b => `<span class="branch-item">${b}</span>`).join('')}
                </div>
            `;
            display.appendChild(section);
        }

    } catch (error) {
        display.innerHTML = "<p style='color:red'>❌ Falha na conexão com o servidor Python (FastAPI).</p>";
        console.error(error);
    }
}
