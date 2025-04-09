const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('results');
const paginationContainer = document.createElement('div'); // Contenitore per la paginazione
paginationContainer.classList.add('mt-4', 'd-flex', 'justify-content-center');

// Variabili globali per la paginazione
let currentPage = 1;
const resultsPerPage = 10;
let allResults = [];

// Funzione per cercare libri
function searchBooks(query) {
  if (!query) {
    resultsContainer.innerHTML = '<p class="text-muted">Start typing to search for books...</p>';
    paginationContainer.innerHTML = ''; // Rimuovi la paginazione
    return;
  }

  resultsContainer.innerHTML = '<p>Loading...</p>';
  paginationContainer.innerHTML = ''; // Rimuovi la paginazione

  // OpenLibrary API endpoint
  const apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.docs && data.docs.length > 0) {
        allResults = data.docs; // Salva tutti i risultati
        currentPage = 1; // Resetta alla prima pagina
        displayResults(); // Mostra i risultati della prima pagina
      } else {
        resultsContainer.innerHTML = '<p>No results found.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      resultsContainer.innerHTML = '<p>Something went wrong. Please try again later.</p>';
    });
}

// Funzione per mostrare i risultati della pagina corrente
function displayResults() {
  resultsContainer.innerHTML = ''; // Pulisci i risultati precedenti

  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const pageResults = allResults.slice(startIndex, endIndex);

  const row = document.createElement('div');
  row.classList.add('row', 'g-3'); // Bootstrap row con spaziatura

  pageResults.forEach(book => {
    const col = document.createElement('div');
    col.classList.add('col-md-2'); // Bootstrap column per 5 card per riga

    const card = document.createElement('div');
    card.classList.add('card', 'h-100', 'shadow-sm'); // Bootstrap card

    // Aggiungi immagine del libro o immagine di fallback
    const img = document.createElement('img');
    img.classList.add('card-img-top', 'book-cover');
    if (book.cover_i) {
      img.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    } else {
      img.src = './img/placeholder-book.png'; // Immagine di fallback
    }
    img.alt = book.title || 'Book Cover';
    card.appendChild(img);

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'p-2');

    const title = document.createElement('h6');
    title.classList.add('card-title', 'text-truncate');
    title.textContent = book.title || 'Unknown Title';

    const author = document.createElement('p');
    author.classList.add('card-text', 'small', 'text-muted');
    author.innerHTML = `<strong>Author:</strong> ${book.author_name ? book.author_name.join(', ') : 'Unknown'}`;

    cardBody.appendChild(title);
    cardBody.appendChild(author);
    card.appendChild(cardBody);
    col.appendChild(card);
    row.appendChild(col);
  });

  resultsContainer.appendChild(row);
  updatePagination(); // Aggiorna la barra di navigazione
}

// Funzione per aggiornare la barra di navigazione
function updatePagination() {
  paginationContainer.innerHTML = ''; // Pulisci la barra di navigazione

  const totalPages = Math.ceil(allResults.length / resultsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.classList.add('btn', 'btn-outline-info', 'mx-1');
    pageButton.textContent = i;

    if (i === currentPage) {
      pageButton.classList.add('active');
    }

    pageButton.addEventListener('click', () => {
      currentPage = i;
      displayResults();
    });

    paginationContainer.appendChild(pageButton);
  }

  resultsContainer.parentElement.appendChild(paginationContainer); // Aggiungi la barra di navigazione sotto i risultati
}

// Ascolta l'evento "input" per la ricerca in tempo reale
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  searchBooks(query);
});