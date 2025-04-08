const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('results');

// Funzione per cercare libri
function searchBooks(query) {
  if (!query) {
    resultsContainer.innerHTML = '<p class="text-muted">Start typing to search for books...</p>';
    return;
  }

  resultsContainer.innerHTML = '<p>Loading...</p>';

  // OpenLibrary API endpoint
  const apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      resultsContainer.innerHTML = ''; // Clear previous results

      if (data.docs && data.docs.length > 0) {
        const row = document.createElement('div');
        row.classList.add('row', 'g-3'); // Bootstrap row with spacing

        data.docs.forEach(book => {
          const col = document.createElement('div');
          col.classList.add('col-md-2'); // Bootstrap column for 5 cards per row

          const card = document.createElement('div');
          card.classList.add('card', 'h-100', 'shadow-sm'); // Bootstrap card

          // Aggiungi immagine del libro o immagine di fallback
          const img = document.createElement('img');
          img.classList.add('card-img-top', 'book-cover'); // Aggiungi classe CSS per dimensioni
          if (book.cover_i) {
            img.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`; // URL immagine (dimensione media)
          } else {
            img.src = './img/placeholder-book.png'; // Immagine di fallback
          }
          img.alt = book.title || 'Book Cover';
          card.appendChild(img);

          const cardBody = document.createElement('div');
          cardBody.classList.add('card-body', 'p-2'); // Riduci padding per card più compatte

          const title = document.createElement('h6');
          title.classList.add('card-title', 'text-truncate'); // Troncamento del testo lungo
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
      } else {
        resultsContainer.innerHTML = '<p>No results found.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      resultsContainer.innerHTML = '<p>Something went wrong. Please try again later.</p>';
    });
}

// Ascolta l'evento "input" per la ricerca in tempo reale
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  searchBooks(query);
});