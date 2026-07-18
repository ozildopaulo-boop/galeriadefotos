// ============================================
// SITE DA GALERIA - ATELIÊ SELVAGEM
// ============================================

let fotos = [];
let carrinho = [];
let filtroAtual = 'todas';
let paginaAtualSite = 1;
const ITENS_POR_PAGINA_SITE = 12;
let fotoModalAtual = null;

// ============================================
// CARREGAR DADOS
// ============================================

function carregarFotos() {
    const dados = localStorage.getItem('atelieFotos');
    if (dados) {
        fotos = JSON.parse(dados);
    } else {
        // Dados de exemplo
        fotos = [
            {
                id: 1,
                titulo: 'Sabiá na Chuva',
                especie: 'Turdus rufiventris
