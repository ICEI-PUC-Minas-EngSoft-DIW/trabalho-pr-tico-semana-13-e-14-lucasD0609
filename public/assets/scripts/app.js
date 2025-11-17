document.addEventListener('DOMContentLoaded', () => {
  // URL base da sua API json-server
  // Esta URL é a que o json-server está servindo (http://localhost:3000/albuns)
  const API_URL = "http://localhost:3000/albuns";
  
  // Elementos do DOM
  const container = document.getElementById("lista-albuns");
  const detalhesContainer = document.getElementById("detalhes");


  /**
   * Função para carregar todos os álbuns da API e renderizar na home
   */
  async function carregarAlbuns() {
    // Sai se o container de lista não estiver na página (evita erro no detalhes.html)
    if (!container) return; 

    try {
      // Tenta buscar os dados
      const resposta = await fetch(API_URL);
      if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);
      const albuns = await resposta.json();
      
      renderizarAlbuns(albuns);

    } catch (err) {
      console.error("Erro ao carregar API:", err);
      // Mensagem de erro que aparece se o servidor não estiver rodando
      container.innerHTML = `<p class="text-center text-danger p-4">❌ Erro ao conectar ao servidor JSON. Tente verificar o console do navegador e o terminal.</p>`;
    }
  }


  /**
   * Função para gerar o HTML da lista de álbuns
   * @param {Array} albuns - Lista de objetos de álbuns
   */
  function renderizarAlbuns(albuns) {
    container.innerHTML = albuns.map(a => {
      // Usa imagem do álbum ou um placeholder
      const imageUrl = a.imagem || 'https://placehold.co/400x400/f8f9fa/343a40?text=Sem+Imagem';

      return `
        <div class="col-md-4 mb-4">
          <article class="card h-100 text-center shadow-sm">
            <img src="${imageUrl}" class="card-img-top" alt="${a.titulo}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${a.titulo}</h5>
              <p class="card-text text-muted">${a.autor} (${a.data})</p>
              <p class="card-text">${a.descricao}</p>
              <a href="detalhes.html?id=${a.id}" class="btn btn-dark btn-saiba-mais mt-auto">Saiba Mais</a>
              <!-- Botão de exclusão - Chama a função global deletarAlbum -->
              <button class="btn btn-outline-danger mt-2" onclick="deletarAlbum(${a.id})">Excluir</button>
            </div>
          </article>
        </div>
      `;
    }).join('');
  }

  /**
   * Função para carregar os detalhes de um álbum específico (detalhes.html)
   */
  function carregarDetalhes() {
    // SÓ EXECUTA SE O ELEMENTO 'detalhes' EXISTIR na página
    if (!detalhesContainer) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    if (!id) {
      detalhesContainer.innerHTML = "<p class='text-center'>ID não fornecido. Retorne para a <a href='index.html'>página inicial</a>.</p>";
      return;
    }

    // Busca o álbum específico pelo ID na API
    fetch(`${API_URL}/${id}`)
      .then(r => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then(a => {
        const imageUrl = a.imagem || 'https://placehold.co/400x400/f8f9fa/343a40?text=Sem+Imagem';
        
        detalhesContainer.innerHTML = `
          <div class="card mx-auto shadow-lg" style="max-width:900px;">
            <div class="row g-0">
              <div class="col-md-5">
                <img src="${imageUrl}" alt="${a.titulo}" class="img-fluid detalhe-img w-100 h-100">
              </div>
              <div class="col-md-7">
                <div class="card-body">
                  <h2 class="card-title">${a.titulo}</h2>
                  <p class="text-muted mb-2"><strong>Autor:</strong> ${a.autor} • <strong>Data:</strong> ${a.data}</p>
                  <p class="small text-secondary mb-3"><strong>Categoria:</strong> ${a.categoria}</p>
                  <p class="lead">${a.descricao}</p>
                  <hr>
                  <p>${a.conteudo}</p>
                  <a href="index.html" class="btn btn-dark mt-3">Voltar para Home</a>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .catch(err => {
        console.error("Erro ao carregar detalhes:", err);
        detalhesContainer.innerHTML = `<p class="text-center text-danger">Erro ao carregar detalhes do álbum. Verifique se o servidor JSON está rodando e o ID é válido.</p>`;
      });
  }

  // Funções globais (para serem chamadas diretamente do HTML, como pelo botão Excluir)
  window.deletarAlbum = async function(id) {
    // Substituído o alert() por window.confirm()
    const confirma = window.confirm("Tem certeza que deseja excluir este álbum? Esta ação não pode ser desfeita.");
    if (!confirma) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      
      // Se estiver na home, recarrega a lista
      if (container) {
          await carregarAlbuns(); 
      } else {
          // Se estiver na página de detalhes, volta para a home após a exclusão
          window.location.href = 'index.html';
      }
    } catch (err) {
      console.error("Erro ao excluir álbum:", err);
      alert("Falha ao excluir o álbum. Tente novamente.");
    }
  };


  // Lógica de inicialização: Chama a função apropriada dependendo da página
  if (container) {
    carregarAlbuns(); // Executa para index.html
  } else if (detalhesContainer) {
    carregarDetalhes(); // Executa para detalhes.html
  }
});