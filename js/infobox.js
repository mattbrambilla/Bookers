// Funzione per creare il modal
function createBookModal(book) {
    // Rimuovi eventuali modali esistenti
    const existingModal = document.getElementById('bookModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Crea il container del modal
    const modal = document.createElement('div');
    modal.id = 'bookModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

    // Crea il contenuto del modal
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-secondary rounded-lg shadow-lg w-full max-w-lg p-6 relative';

    // Titolo del libro
    const title = document.createElement('h2');
    title.className = 'text-primary font-bold text-2xl mb-4';
    title.textContent = book.title || 'Unknown Title';

    // Autore del libro
    const author = document.createElement('p');
    author.className = 'text-text mb-2';
    author.innerHTML = `<strong>Author:</strong> ${book.author_name ? book.author_name.join(', ') : 'Unknown Author'}`;

    // Anno di pubblicazione
    const year = document.createElement('p');
    year.className = 'text-text mb-4';
    year.innerHTML = `<strong>First Published:</strong> ${book.first_publish_year || 'N/A'}`;

    // Descrizione (simulata)
    const description = document.createElement('p');
    description.className = 'text-text mb-4';
    description.textContent = book.description || 'No description available for this book.';

    // Pulsante di chiusura
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-4 right-4 text-background bg-primary hover:bg-hover rounded-full w-8 h-8 flex items-center justify-center';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => modal.remove();

    // Aggiungi gli elementi al contenuto del modal
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(author);
    modalContent.appendChild(year);
    modalContent.appendChild(description);

    // Aggiungi il contenuto al container del modal
    modal.appendChild(modalContent);

    // Aggiungi il modal al body
    document.body.appendChild(modal);
}

// Funzione per mostrare i dettagli del libro
function showBookDetails(book) {
    createBookModal(book);
}