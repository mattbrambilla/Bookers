// Integrazione finale di tutti i componenti JavaScript
// Questo file combina le funzionalità di search.js e infobox.js con le nuove funzionalità Tailwind

// Elementi DOM
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('results');
const paginationContainer = document.getElementById('pagination');

// Variabili globali per la paginazione
let currentPage = 1;
let resultsPerPage = 10;
let allResults = [];

// Funzione per cercare libri
function searchBooks(query) {
    if (!query) {
        resultsContainer.innerHTML = '<p class="text-center text-text/70">Start typing to search for books...</p>';
        paginationContainer.innerHTML = '';
        return;
    }
    
    resultsContainer.innerHTML = '<p class="text-center text-text/70"><span class="loading">Loading...</span></p>';
    paginationContainer.innerHTML = '';
    
    // OpenLibrary API endpoint
    const apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.docs && data.docs.length > 0) {
                allResults = data.docs;
                displayResults(allResults, 1);
            } else {
                resultsContainer.innerHTML = '<p class="text-center text-text/70">No books found. Try a different search term.</p>';
                paginationContainer.innerHTML = '';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            resultsContainer.innerHTML = '<p class="text-center text-text/70">An error occurred while searching. Please try again later.</p>';
            paginationContainer.innerHTML = '';
        });
}

// Funzione per creare una card libro con Tailwind CSS
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card bg-secondary rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-border-color flex flex-col';

    // Immagine copertina
    const img = document.createElement('img');
    img.src = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : './img/no-cover.png';
    img.alt = book.title || 'Book Cover';
    img.className = 'w-full h-48 object-cover';
    card.appendChild(img);

    // Contenuto della card
    const content = document.createElement('div');
    content.className = 'p-4 flex-grow flex flex-col';

    // Titolo
    const title = document.createElement('h3');
    title.className = 'font-bold text-primary mb-2';
    title.textContent = book.title || 'Unknown Title';
    content.appendChild(title);

    // Autore
    const author = document.createElement('p');
    author.className = 'text-text text-sm mb-4';
    author.textContent = book.author_name ? book.author_name.join(', ') : 'Unknown Author';
    content.appendChild(author);

    // Pulsante dettagli
    const detailsButton = document.createElement('button');
    detailsButton.className = 'mt-auto bg-primary hover:bg-hover text-background py-2 px-4 rounded transition-colors';
    detailsButton.textContent = 'View Details';
    detailsButton.onclick = () => showBookDetails(book);
    content.appendChild(detailsButton);

    card.appendChild(content);
    return card;
}
// Funzione per creare i pulsanti di paginazione con Tailwind CSS
function createPaginationButtons(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';
    paginationContainer.className = 'flex justify-center items-center space-x-2 my-8';
    
    // Pulsante precedente
    const prevButton = document.createElement('button');
    prevButton.className = 'w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 bg-white text-text/70 hover:bg-secondary/30 hover:text-primary hover:border-hover transition-colors';
    prevButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>';
    prevButton.disabled = currentPage === 1;
    prevButton.style.opacity = currentPage === 1 ? '0.5' : '1';
    prevButton.onclick = function() {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };
    paginationContainer.appendChild(prevButton);
    
    // Determina quali numeri di pagina mostrare
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // Pulsanti numerici
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        if (i === currentPage) {
            pageButton.className = 'w-10 h-10 flex items-center justify-center rounded-md border border-primary bg-primary text-white font-medium';
        } else {
            pageButton.className = 'w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 bg-white text-text hover:bg-secondary/30 hover:text-primary hover:border-hover transition-colors';
        }
        pageButton.textContent = i;
        pageButton.onclick = function() {
            goToPage(i);
        };
        paginationContainer.appendChild(pageButton);
    }
    
    // Pulsante successivo
    const nextButton = document.createElement('button');
    nextButton.className = 'w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 bg-white text-text/70 hover:bg-secondary/30 hover:text-primary hover:border-hover transition-colors';
    nextButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.style.opacity = currentPage === totalPages ? '0.5' : '1';
    nextButton.onclick = function() {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };
    paginationContainer.appendChild(nextButton);
}

// Funzione per visualizzare i risultati della ricerca con Tailwind CSS
function displayResults(books, page) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    
    if (books.length === 0) {
        resultsContainer.innerHTML = '<p class="text-center text-text/70">No books found. Try a different search term.</p>';
        return;
    }
    
    // Crea un contenitore a griglia per i risultati
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6';
    
    // Calcola l'indice di inizio e fine per la pagina corrente
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = Math.min(startIndex + resultsPerPage, books.length);
    
    // Aggiungi le card dei libri alla griglia
    for (let i = startIndex; i < endIndex; i++) {
        const book = books[i];
        const card = createBookCard(book);
        grid.appendChild(card);
    }
    
    resultsContainer.appendChild(grid);
    
    // Crea i pulsanti di paginazione
    const totalPages = Math.ceil(books.length / resultsPerPage);
    createPaginationButtons(page, totalPages);
}

// Funzione per cambiare pagina
function goToPage(page) {
    currentPage = page;
    displayResults(allResults, currentPage);
    
    // Scorri verso l'alto per mostrare i nuovi risultati
    window.scrollTo({
        top: resultsContainer.offsetTop - 100,
        behavior: 'smooth'
    });
}

// Funzione per mostrare i dettagli del libro in un modal con Tailwind CSS
function createBookModal(book) {
    // Crea il container del modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.id = 'bookModal';
    
    // Crea il contenuto del modal
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-fadeIn';
    
    // Pulsante di chiusura
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-4 right-4 text-gray-500 hover:text-primary transition-colors';
    closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
    closeButton.onclick = function() {
        document.body.removeChild(modal);
    };
    
    // Layout a due colonne
    const layout = document.createElement('div');
    layout.className = 'grid grid-cols-1 md:grid-cols-3 gap-6 p-6';
    
    // Colonna sinistra (immagine)
    const leftColumn = document.createElement('div');
    leftColumn.className = 'md:col-span-1';
    
    const imgContainer = document.createElement('div');
    imgContainer.className = 'rounded-lg overflow-hidden shadow-lg bg-gray-100';
    
    const img = document.createElement('img');
    if (book.cover_i) {
        img.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
    } else {
        img.src = 'img/no-cover.png'; // Immagine placeholder
    }
    img.alt = book.title || 'Book Cover';
    img.className = 'w-full h-auto object-cover';
    
    imgContainer.appendChild(img);
    leftColumn.appendChild(imgContainer);
    
    // Colonna destra (informazioni)
    const rightColumn = document.createElement('div');
    rightColumn.className = 'md:col-span-2';
    
    // Titolo
    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold text-primary mb-2';
    title.textContent = book.title || 'Unknown Title';
    
    // Autore
    const author = document.createElement('p');
    author.className = 'text-lg text-text/80 mb-4';
    author.textContent = book.author_name ? `by ${book.author_name.join(', ')}` : 'Unknown Author';
    
    // Dettagli
    const details = document.createElement('div');
    details.className = 'space-y-4 mb-6';
    
    // Funzione per aggiungere una riga di dettagli
    function addDetailRow(label, value) {
        if (!value) return null;
        
        const row = document.createElement('div');
        row.className = 'grid grid-cols-3 gap-4';
        
        const labelElement = document.createElement('div');
        labelElement.className = 'col-span-1 text-text/60 font-medium';
        labelElement.textContent = label;
        
        const valueElement = document.createElement('div');
        valueElement.className = 'col-span-2 text-text';
        valueElement.textContent = value;
        
        row.appendChild(labelElement);
        row.appendChild(valueElement);
        
        return row;
    }
    
    // Aggiungi dettagli se disponibili
    const publishYear = book.first_publish_year ? addDetailRow('Published', book.first_publish_year) : null;
    const publisher = book.publisher && book.publisher.length > 0 ? addDetailRow('Publisher', book.publisher[0]) : null;
    const language = book.language && book.language.length > 0 ? addDetailRow('Language', book.language.join(', ')) : null;
    const subjects = book.subject && book.subject.length > 0 ? addDetailRow('Subjects', book.subject.slice(0, 3).join(', ')) : null;
    
    if (publishYear) details.appendChild(publishYear);
    if (publisher) details.appendChild(publisher);
    if (language) details.appendChild(language);
    if (subjects) details.appendChild(subjects);
    
    // Descrizione (simulata)
    const descriptionTitle = document.createElement('h3');
    descriptionTitle.className = 'text-lg font-semibold text-primary mt-6 mb-2';
    descriptionTitle.textContent = 'Description';
    
    const description = document.createElement('p');
    description.className = 'text-text/80 leading-relaxed';
    description.textContent = 'No description available for this book. Please check the Open Library website for more information.';
    
    // Pulsanti azione
    const actions = document.createElement('div');
    actions.className = 'flex flex-wrap gap-3 mt-6';
    
    const openLibraryButton = document.createElement('a');
    openLibraryButton.href = `https://openlibrary.org${book.key}`;
    openLibraryButton.target = '_blank';
    openLibraryButton.className = 'bg-primary hover:bg-hover text-white py-2 px-4 rounded transition-colors';
    openLibraryButton.textContent = 'View on Open Library';
    
    const addToListButton = document.createElement('button');
    addToListButton.className = 'bg-secondary hover:bg-secondary/80 text-primary py-2 px-4 rounded transition-colors';
    addToListButton.textContent = 'Add to Reading List';
    
    actions.appendChild(openLibraryButton);
    actions.appendChild(addToListButton);
    
    // Assembla la colonna destra
    rightColumn.appendChild(title);
    rightColumn.appendChild(author);
    rightColumn.appendChild(details);
    rightColumn.appendChild(descriptionTitle);
    rightColumn.appendChild(description);
    rightColumn.appendChild(actions);
    
    // Assembla il layout
    layout.appendChild(leftColumn);
    layout.appendChild(rightColumn);
    
    // Assembla il modal
    modalContent.appendChild(closeButton);
    modalContent.appendChild(layout);
    modal.appendChild(modalContent);
    
    return modal;
}

// Funzione per mostrare i dettagli del libro
function showBookDetails(book) {
    const modal = createBookModal(book);
    document.body.appendChild(modal);
    
    // Aggiungi event listener per chiudere il modal cliccando fuori
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Event listener per la ricerca
searchInput.addEventListener('input', function() {
    const query = this.value.trim();
    searchBooks(query);
});

// Aggiungi animazione per il modal
document.head.insertAdjacentHTML('beforeend', `
<style>
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
}
.loading:after {
    content: '...';
    animation: dots 1.5s steps(5, end) infinite;
}
@keyframes dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60% { content: '...'; }
    80%, 100% { content: ''; }
}
</style>
`);

// Inizializza la pagina
document.addEventListener('DOMContentLoaded', function() {
    // Mostra il messaggio iniziale
    resultsContainer.innerHTML = '<p class="text-center text-text/70">Start typing to search for books...</p>';
});
