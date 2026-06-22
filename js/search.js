// Integrazione finale di tutti i componenti JavaScript
// Questo file combina le funzionalità di search.js e infobox.js con le nuove funzionalità Tailwind

// Elementi DOM
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('results');
const paginationContainer = document.getElementById('pagination');
const navbarSearchSlot = document.getElementById('navbarSearchSlot');
const heroSearchSlot = document.getElementById('heroSearchSlot');
const heroSection = document.getElementById('heroSection');
const searchWrapper = document.getElementById('searchWrapper');

// Sidebar elementi mobile
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileSidebar = document.getElementById('mobileSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebarLinks = document.querySelectorAll('.sidebar-link');

function isMobile() {
    return window.innerWidth < 768;
}

function openSidebar() {
    mobileSidebar.classList.add('open');
    sidebarOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    mobileSidebar.classList.remove('open');
    sidebarOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}

mobileMenuBtn?.addEventListener('click', openSidebar);
closeSidebarBtn?.addEventListener('click', closeSidebar);
sidebarOverlay?.addEventListener('click', closeSidebar);
sidebarLinks.forEach(link => link.addEventListener('click', closeSidebar));

// Variabili globali per la paginazione
let currentPage = 1;
let resultsPerPage = 10;
let allResults = [];
let currentController = null;
let lastQuery = '';

// Categorie
const categoriesSection = document.getElementById('categoriesSection');
const categoriesGrid = document.getElementById('categoriesGrid');
const heroTitle = document.getElementById('heroTitle');
const heroSubtitle = document.getElementById('heroSubtitle');
let currentView = 'home';
let currentCategory = null;
let currentCategoryBooks = [];

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Sposta la barra di ricerca nella navbar (solo desktop)
function moveSearchToNavbar() {
    if (isMobile()) {
        // Su mobile la search resta nell'hero
        if (searchWrapper && searchWrapper.parentElement !== heroSearchSlot) {
            heroSearchSlot?.appendChild(searchWrapper);
            searchWrapper.classList.remove('search-in-navbar');
            navbarSearchSlot?.classList.add('hidden');
            heroSection?.classList.remove('hero-hidden');
        }
        return;
    }
    if (navbarSearchSlot && searchWrapper && searchWrapper.parentElement !== navbarSearchSlot) {
        navbarSearchSlot.classList.remove('hidden');
        navbarSearchSlot.appendChild(searchWrapper);
        searchWrapper.classList.add('search-in-navbar');
        heroSection?.classList.add('hero-hidden');
    }
}

// Riporta la barra di ricerca nell'hero
function moveSearchToHero() {
    if (heroSearchSlot && searchWrapper && searchWrapper.parentElement !== heroSearchSlot) {
        heroSearchSlot.appendChild(searchWrapper);
        searchWrapper.classList.remove('search-in-navbar');
        navbarSearchSlot?.classList.add('hidden');
        heroSection?.classList.remove('hero-hidden');
    }
}

// === Categorie ===
const categories = [
    { name: 'Fiction',          emoji: '📚', color: 'from-blue-600 to-blue-400' },
    { name: 'Fantasy',          emoji: '🐉', color: 'from-purple-600 to-purple-400' },
    { name: 'Science Fiction',  emoji: '🚀', color: 'from-indigo-600 to-indigo-400' },
    { name: 'Mystery',          emoji: '🔍', color: 'from-gray-700 to-gray-500' },
    { name: 'Romance',          emoji: '💕', color: 'from-pink-500 to-pink-300' },
    { name: 'Horror',           emoji: '👻', color: 'from-red-800 to-red-600' },
    { name: 'History',          emoji: '📜', color: 'from-amber-700 to-amber-500' },
    { name: 'Biography',        emoji: '👤', color: 'from-teal-600 to-teal-400' },
    { name: 'Science',          emoji: '🔬', color: 'from-cyan-600 to-cyan-400' },
    { name: 'Philosophy',       emoji: '💭', color: 'from-stone-600 to-stone-400' },
    { name: 'Poetry',           emoji: '🖋️', color: 'from-rose-500 to-rose-300' },
    { name: 'Art',              emoji: '🎨', color: 'from-orange-500 to-orange-300' },
    { name: 'Music',            emoji: '🎵', color: 'from-violet-500 to-violet-300' },
    { name: 'Travel',           emoji: '🌍', color: 'from-emerald-600 to-emerald-400' },
    { name: 'Cooking',          emoji: '🍳', color: 'from-red-500 to-red-300' },
    { name: 'Business',         emoji: '💼', color: 'from-sky-700 to-sky-500' },
    { name: 'Self-Help',        emoji: '🌱', color: 'from-green-600 to-green-400' },
    { name: 'Comics',           emoji: '💬', color: 'from-yellow-600 to-yellow-400' },
    { name: 'Children',         emoji: '🧒', color: 'from-blue-400 to-blue-200' },
    { name: 'Technology',       emoji: '💻', color: 'from-slate-600 to-slate-400' },
];

function normalizeBook(book) {
    return {
        title: book.title,
        author_name: book.author_name || (book.authors ? book.authors.map(a => a.name) : undefined),
        first_publish_year: book.first_publish_year,
        cover_i: book.cover_i || book.cover_id,
        key: book.key,
        publisher: book.publisher,
        language: book.language,
        subject: book.subject,
    };
}

function showHomeView() {
    currentView = 'home';
    heroTitle.textContent = 'Bookers';
    heroSubtitle.textContent = 'Where all book lovers search info';
    categoriesSection?.classList.add('hidden');
    resultsContainer.innerHTML = '<p class="text-center text-text/70">Start typing to search for books...</p>';
    paginationContainer.innerHTML = '';
    moveSearchToHero();
    if (isMobile()) closeSidebar();
}

function renderCategoryGrid() {
    categoriesGrid.innerHTML = '';
    categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card bg-gradient-to-br ' + cat.color + ' text-white rounded-xl shadow-lg';
        card.innerHTML = `
            <span class="category-emoji">${cat.emoji}</span>
            <span class="category-name">${cat.name}</span>
        `;
        card.addEventListener('click', () => fetchCategoryBooks(cat.name));
        categoriesGrid.appendChild(card);
    });
}

function showCategoriesView() {
    currentView = 'categories';
    heroTitle.textContent = 'Browse Categories';
    heroSubtitle.textContent = 'Select a category to explore books';
    categoriesSection?.classList.remove('hidden');
    resultsContainer.innerHTML = '';
    paginationContainer.innerHTML = '';
    moveSearchToHero();
    if (isMobile()) closeSidebar();
    renderCategoryGrid();
}

function showAllCategories() {
    showCategoriesView();
}

function fetchCategoryBooks(categoryDisplayName) {
    if (currentController) {
        currentController.abort();
    }
    currentController = new AbortController();
    const signal = currentController.signal;

    const subject = categoryDisplayName.toLowerCase().replace(/\s+/g, '_');

    currentView = 'category-books';
    currentCategory = categoryDisplayName;
    currentCategoryBooks = [];
    categoriesSection?.classList.add('hidden');

    heroTitle.textContent = categoryDisplayName;
    heroSubtitle.innerHTML = '<button onclick="showAllCategories()" class="text-accent hover:text-accent-hover transition-colors">← Back to Categories</button>';

    resultsContainer.innerHTML = createSkeletonCards(6);
    paginationContainer.innerHTML = '';

    const apiUrl = `https://openlibrary.org/subjects/${encodeURIComponent(subject)}.json?limit=20`;

    fetch(apiUrl, { signal })
        .then(response => response.json())
        .then(data => {
            if (data.works && data.works.length > 0) {
                currentCategoryBooks = data.works.map(normalizeBook);
                lastQuery = '';
                allResults = currentCategoryBooks;
                displayResults(allResults, 1);
            } else {
                resultsContainer.innerHTML = '<p class="text-center text-text/70">No books found in this category.</p>';
                paginationContainer.innerHTML = '';
            }
        })
        .catch(error => {
            if (error.name === 'AbortError') return;
            console.error('Error fetching category:', error);
            resultsContainer.innerHTML = '<p class="text-center text-text/70">An error occurred while loading this category. Please try again later.</p>';
            paginationContainer.innerHTML = '';
        });
}

// Genera scheletri per il caricamento
function createSkeletonCards(count) {
    let cards = '';
    for (let i = 0; i < count; i++) {
        cards += `
            <div class="skeleton-card">
                <div class="skeleton-image skeleton-shimmer"></div>
                <div class="p-4 flex flex-col">
                    <div class="skeleton-line skeleton-shimmer"></div>
                    <div class="skeleton-line short skeleton-shimmer"></div>
                    <div class="skeleton-line medium skeleton-shimmer"></div>
                    <div class="skeleton-button skeleton-shimmer"></div>
                </div>
            </div>`;
    }
    return `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">${cards}</div>`;
}

// Funzione per cercare libri
function searchBooks(query) {
    if (currentController) {
        currentController.abort();
    }
    currentController = new AbortController();
    const signal = currentController.signal;

    if (!query) {
        moveSearchToHero();
        resultsContainer.innerHTML = '<p class="text-center text-text/70">Start typing to search for books...</p>';
        paginationContainer.innerHTML = '';
        return;
    }

    moveSearchToNavbar();
    lastQuery = query;

    resultsContainer.innerHTML = createSkeletonCards(6);
    paginationContainer.innerHTML = '';

    const apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;

    fetch(apiUrl, { signal })
        .then(response => response.json())
        .then(data => {
            if (data.docs && data.docs.length > 0) {
                allResults = data.docs;
                displayResults(allResults, 1);
            } else {
                resultsContainer.innerHTML = `<p class="text-center text-text/70">No books found for "<strong>${query}</strong>". Try different keywords.</p>`;
                paginationContainer.innerHTML = '';
            }
        })
        .catch(error => {
            if (error.name === 'AbortError') return;
            console.error('Error fetching data:', error);
            resultsContainer.innerHTML = '<p class="text-center text-text/70">An error occurred while searching. Please try again later.</p>';
            paginationContainer.innerHTML = '';
        });
}

// Funzione per creare una card libro con layout orizzontale
function createBookCard(book, index = 0) {
    const card = document.createElement('div');
    card.className = 'bg-surface rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-border flex flex-row animate-fadeInUp';
    card.style.animationDelay = `${index * 0.08}s`;

    // Immagine copertina (sx su desktop, top su mobile)
    const imgContainer = document.createElement('div');
    imgContainer.className = 'w-24 sm:w-32 md:w-36 flex-shrink-0 flex items-center justify-center bg-surface';

    if (book.cover_i) {
        const img = document.createElement('img');
        img.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
        img.alt = book.title || 'Book Cover';
        img.className = 'w-full h-full object-cover';
        imgContainer.appendChild(img);
    } else {
        imgContainer.innerHTML = '<svg class="w-16 h-16 text-text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>';
    }
    card.appendChild(imgContainer);

    // Contenuto (dx su desktop, bottom su mobile)
    const content = document.createElement('div');
    content.className = 'p-4 flex flex-col justify-between flex-grow min-w-0';

    // Titolo
    const title = document.createElement('h3');
    title.className = 'font-bold text-primary text-base leading-tight';
    title.textContent = book.title || 'Unknown Title';
    content.appendChild(title);

    // Autore
    const author = document.createElement('p');
    author.className = 'text-text text-sm mt-1';
    author.textContent = book.author_name ? `di ${book.author_name.join(', ')}` : 'Unknown Author';
    content.appendChild(author);

    // Anno
    const year = document.createElement('p');
    year.className = 'text-text-muted text-sm mt-1 mb-4';
    if (book.first_publish_year) {
        year.textContent = `📅 ${book.first_publish_year}`;
    } else {
        year.textContent = '';
    }
    content.appendChild(year);

    // Pulsante dettagli
    const detailsButton = document.createElement('button');
    detailsButton.className = 'self-start bg-primary hover:bg-primary-hover text-background py-2 px-4 rounded transition-colors';
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
    prevButton.className = 'w-10 h-10 flex items-center justify-center rounded-md border border-border bg-white text-text/70 hover:bg-surface hover:text-primary hover:border-primary transition-colors';
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
            pageButton.className = 'w-10 h-10 flex items-center justify-center rounded-md border border-border bg-white text-text hover:bg-surface hover:text-primary hover:border-primary transition-colors';
        }
        pageButton.textContent = i;
        pageButton.onclick = function() {
            goToPage(i);
        };
        paginationContainer.appendChild(pageButton);
    }
    
    // Pulsante successivo
    const nextButton = document.createElement('button');
    nextButton.className = 'w-10 h-10 flex items-center justify-center rounded-md border border-border bg-white text-text/70 hover:bg-surface hover:text-primary hover:border-primary transition-colors';
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

    const countMsg = document.createElement('p');
    countMsg.className = 'text-text/70 mb-6 text-center';
    countMsg.textContent = `${books.length} result${books.length !== 1 ? 's' : ''} found${lastQuery ? ` for "${lastQuery}"` : ''}`;
    resultsContainer.appendChild(countMsg);

    // Crea un contenitore a griglia per i risultati
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    
    // Calcola l'indice di inizio e fine per la pagina corrente
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = Math.min(startIndex + resultsPerPage, books.length);
    
    // Aggiungi le card dei libri alla griglia
    for (let i = startIndex; i < endIndex; i++) {
        const book = books[i];
        const card = createBookCard(book, i - startIndex);
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
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4';
    modal.id = 'bookModal';
    
    // Crea il contenuto del modal
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-scaleIn';
    
    // Pulsante di chiusura
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-4 right-4 text-text-muted hover:text-primary transition-colors';
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
    imgContainer.className = 'rounded-lg overflow-hidden shadow-lg bg-surface';

    if (book.cover_i) {
        const img = document.createElement('img');
        img.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
        img.alt = book.title || 'Book Cover';
        img.className = 'w-full h-auto object-cover';
        imgContainer.appendChild(img);
    } else {
        imgContainer.className = 'rounded-lg overflow-hidden shadow-lg bg-surface flex items-center justify-center p-12';
        imgContainer.innerHTML = '<svg class="w-24 h-24 text-text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>';
    }
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
    openLibraryButton.className = 'bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded transition-colors';
    openLibraryButton.textContent = 'View on Open Library';
    
    const addToListButton = document.createElement('button');
    addToListButton.className = 'bg-surface hover:bg-surface/80 text-primary py-2 px-4 rounded transition-colors';
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

// Event listener per la ricerca con debounce
searchInput.addEventListener('input', debounce(function() {
    const query = this.value.trim();
    if (query.length < 2) {
        moveSearchToHero();
        paginationContainer.innerHTML = '';
        if (currentView === 'categories') {
            categoriesSection?.classList.remove('hidden');
            resultsContainer.innerHTML = '';
        } else if (currentView === 'category-books' && currentCategoryBooks.length > 0) {
            resultsContainer.innerHTML = '';
            allResults = currentCategoryBooks;
            displayResults(allResults, 1);
        } else {
            resultsContainer.innerHTML = '<p class="text-center text-text/70">Start typing to search for books...</p>';
        }
        return;
    }
    categoriesSection?.classList.add('hidden');
    searchBooks(query);
}, 300));

// Event listener per navigazione
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const view = this.dataset.view;
        if (view === 'home') showHomeView();
        else if (view === 'categories') showCategoriesView();
    });
});

// Gestisce ridimensionamento finestra
window.addEventListener('resize', function() {
    if (!isMobile()) {
        closeSidebar();
    }
    // Rialloca la search bar se la ricerca è attiva
    const query = searchInput.value.trim();
    if (query.length >= 2 && lastQuery) {
        moveSearchToNavbar();
    }
});

// Inizializza la pagina
document.addEventListener('DOMContentLoaded', function() {
    // Mostra il messaggio iniziale
    resultsContainer.innerHTML = '<p class="text-center text-text/70">Start typing to search for books...</p>';
});
