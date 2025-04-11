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
</style>
`);
