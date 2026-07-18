// ============================================
// PAINEL ADMIN - ATELIÊ SELVAGEM
// ============================================

let fotos = [];
let fotoEditando = null;
let arquivosSelecionados = [];
let paginaAtual = 1;
const ITENS_POR_PAGINA = 12;

// ============================================
// CARREGAR DADOS
// ============================================

function carregarDados() {
    const dados = localStorage.getItem('atelieFotos');
    if (dados) {
        fotos = JSON.parse(dados);
    } else {
        // Dados de exemplo para começar
        fotos = [
            {
                id: 1,
                titulo: 'Sabiá na Chuva',
                especie: 'Turdus rufiventris',
                local: 'Serra do Mar - SP',
                data: '2024-06-15',
                preco: '80',
                categoria: 'aves',
                tags: 'sabiá, chuva, serra',
                descricao: 'Esperei 3 horas na chuva para capturar esse momento. O sabiá parecia estar tão feliz na água que esqueci do frio.',
                imagem: '../uploads/sabia_chuva_serra.jpg'
            },
            {
                id: 2,
                titulo: 'Gavião Real',
                especie: 'Harpia harpyja',
                local: 'Pantanal - MT',
                data: '2024-05-20',
                preco: '120',
                categoria: 'aves',
                tags: 'gavião, real, pantanal',
                descricao: 'O majestoso Gavião-Real é a ave de rapina mais poderosa das Américas.',
                imagem: '../uploads/gaviao_real.jpg'
            }
        ];
        salvarDados();
    }
    atualizarContador();
    renderizarGrid();
}

function salvarDados() {
    localStorage.setItem('atelieFotos', JSON.stringify(fotos));
    atualizarContador();
}

function atualizarContador() {
    document.getElementById('totalFotos').textContent = fotos.length;
}

// ============================================
// UPLOAD DE FOTOS
// ============================================

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const arquivos = e.dataTransfer.files;
    processarArquivos(arquivos);
});

fileInput.addEventListener('change', (e) => {
    processarArquivos(e.target.files);
});

function processarArquivos(arquivos) {
    const imagens = Array.from(arquivos).filter(file => file.type.startsWith('image/'));
    
    if (imagens.length === 0) {
        mostrarFeedback('error', 'Selecione apenas imagens (JPG, PNG, etc.)');
        return;
    }
    
    const progressDiv = document.getElementById('uploadProgress');
    progressDiv.style.display = 'block';
    
    let processadas = 0;
    
    imagens.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Salvar a imagem no localStorage (para demonstração)
            // Em produção, isso seria enviado para um servidor
            const imagemBase64 = e.target.result;
            
            // Criar objeto da foto
            const novaFoto = {
                id: Date.now() + index,
                titulo: file.name.replace(/\.[^/.]+$/, ''),
                especie: '',
                local: '',
                data: new Date().toISOString().split('T')[0],
                preco: '50',
                categoria: 'aves',
                tags: '',
                descricao: '',
                imagem: imagemBase64 // Em produção, seria o caminho do arquivo
            };
            
            fotos.push(novaFoto);
            processadas++;
            
            // Atualizar progresso
            const progresso = (processadas / imagens.length) * 100;
            document.getElementById('progressFill').style.width = progresso + '%';
            document.getElementById('progressText').textContent = 
                `Enviando... ${processadas} de ${imagens.length} fotos`;
            
            if (processadas === imagens.length) {
                salvarDados();
                renderizarGrid();
                mostrarFeedback('success', `${imagens.length} fotos enviadas com sucesso!`);
                setTimeout(() => {
                    document.getElementById('uploadProgress').style.display = 'none';
                    document.getElementById('progressFill').style.width = '0%';
                }, 2000);
            }
        };
        reader.readAsDataURL(file);
    });
}

// ============================================
// EDITAR FOTO
// ============================================

function editarFoto(id) {
    fotoEditando = fotos.find(f => f.id === id);
    if (!fotoEditando) return;
    
    document.getElementById('editor').classList.add('show');
    document.getElementById('previewImage').src = fotoEditando.imagem;
    document.getElementById('titulo').value = fotoEditando.titulo || '';
    document.getElementById('especie').value = fotoEditando.especie || '';
    document.getElementById('local').value = fotoEditando.local || '';
    document.getElementById('data').value = fotoEditando.data || '';
    document.getElementById('preco').value = fotoEditando.preco || '';
    document.getElementById('categoria').value = fotoEditando.categoria || 'aves';
    document.getElementById('tags').value = fotoEditando.tags || '';
    document.getElementById('descricao').value = fotoEditando.descricao || '';
    
    // Scroll para o editor
    document.getElementById('editor').scrollIntoView({ behavior: 'smooth' });
}

function salvarFoto() {
    if (!fotoEditando) {
        mostrarFeedback('error', 'Nenhuma foto selecionada para editar');
        return;
    }
    
    // Validar campos obrigatórios
    const titulo = document.getElementById('titulo').value.trim();
    if (!titulo) {
        mostrarFeedback('error', 'O título é obrigatório!');
        return;
    }
    
    // Atualizar dados
    fotoEditando.titulo = titulo;
    fotoEditando.especie = document.getElementById('especie').value.trim();
    fotoEditando.local = document.getElementById('local').value.trim();
    fotoEditando.data = document.getElementById('data').value;
    fotoEditando.preco = document.getElementById('preco').value;
    fotoEditando.categoria = document.getElementById('categoria').value;
    fotoEditando.tags = document.getElementById('tags').value.trim();
    fotoEditando.descricao = document.getElementById('descricao').value.trim();
    
    salvarDados();
    renderizarGrid();
    mostrarFeedback('success', 'Foto salva com sucesso! ✅');
    
    setTimeout(() => {
        document.getElementById('editor').classList.remove('show');
        fotoEditando = null;
    }, 1500);
}

function excluirFoto() {
    if (!fotoEditando) return;
    
    if (confirm(`Tem certeza que deseja excluir "${fotoEditando.titulo}"?`)) {
        fotos = fotos.filter(f => f.id !== fotoEditando.id);
        salvarDados();
        renderizarGrid();
        document.getElementById('editor').classList.remove('show');
        fotoEditando = null;
        mostrarFeedback('success', 'Foto excluída com sucesso! 🗑️');
    }
}

function cancelarEdicao() {
    document.getElementById('editor').classList.remove('show');
    fotoEditando = null;
}

// ============================================
// RENDERIZAR GRID
// ============================================

function renderizarGrid() {
    const grid = document.getElementById('gridFotos');
    const buscar = document.getElementById('buscar').value.toLowerCase();
    const categoria = document.getElementById('filtroCategoria').value;
    
    let filtradas = fotos;
    
    if (buscar) {
        filtradas = filtradas.filter(f => 
            f.titulo.toLowerCase().includes(buscar) ||
            f.especie.toLowerCase().includes(buscar) ||
            f.tags.toLowerCase().includes(buscar)
        );
    }
    
    if (categoria !== 'todas') {
        filtradas = filtradas.filter(f => f.categoria === categoria);
    }
    
    // Paginação
    const totalPaginas = Math.ceil(filtradas.length / ITENS_POR_PAGINA);
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas || 1;
    
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const paginadas = filtradas.slice(inicio, fim);
    
    if (paginadas.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:40px; color:#999;">
                📭 Nenhuma foto encontrada
                <br><span style="font-size:0.9rem;">Faça upload das suas fotos para começar</span>
            </div>
        `;
    } else {
        grid.innerHTML = paginadas.map(foto => `
            <div class="foto-card" onclick="editarFoto(${foto.id})">
                <img src="${foto.imagem}" alt="${foto.titulo}" loading="lazy">
                <span class="card-badge">${foto.categoria}</span>
                <div class="card-info">
                    <h4>${foto.titulo}</h4>
                    <span class="card-price">R$ ${foto.preco}</span>
                </div>
            </div>
        `).join('');
    }
    
    // Paginação
    renderizarPaginacao(totalPaginas);
}

function renderizarPaginacao(total) {
    const container = document.getElementById('paginacao');
    if (total <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = `<button onclick="irPagina(${paginaAtual - 1})" ${paginaAtual === 1 ? 'disabled' : ''}>◀</button>`;
    
    for (let i = 1; i <= total; i++) {
        if (i === paginaAtual) {
            html += `<button class="active">${i}</button>`;
        } else if (i === 1 || i === total || Math.abs(i - paginaAtual) <= 2) {
            html += `<button onclick="irPagina(${i})">${i}</button>`;
        } else if (i === paginaAtual - 3 || i === paginaAtual + 3) {
            html += `<span style="padding:0 8px;">...</span>`;
        }
    }
    
    html += `<button onclick="irPagina(${paginaAtual + 1})" ${paginaAtual === total ? 'disabled' : ''}>▶</button>`;
    container.innerHTML = html;
}

function irPagina(pagina) {
    const total = Math.ceil(fotos.length / ITENS_POR_PAGINA);
    if (pagina < 1 || pagina > total) return;
    paginaAtual = pagina;
    renderizarGrid();
}

function filtrarFotos() {
    paginaAtual = 1;
    renderizarGrid();
}

// ============================================
// FEEDBACK
// ============================================

function mostrarFeedback(tipo, mensagem) {
    const el = document.getElementById('mensagemFeedback');
    el.className = 'feedback ' + tipo;
    el.textContent = mensagem;
    el.style.display = 'block';
    
    setTimeout(() => {
        el.style.display = 'none';
    }, 4000);
}

// ============================================
// ABRIR SITE
// ============================================

function abrirSite() {
    window.open('../galeria-site/index.html', '_blank');
}

// ============================================
// INICIAR
// ============================================

carregarDados();
