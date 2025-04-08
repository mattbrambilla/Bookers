document.getElementById('searchButton').addEventListener('click', function () {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) {
    alert('Please enter a search term!');
    return;
  }

  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '<p>Loading...</p>';

  // OpenLibrary API endpoint
  const apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      resultsContainer.innerHTML = ''; // Clear previous results

      if (data.docs && data.docs.length > 0) {
        const row = document.createElement('div');
        row.classList.add('row', 'g-4'); // Bootstrap row with spacing

        data.docs.forEach(book => {
          const col = document.createElement('div');
          col.classList.add('col-md-4'); // Bootstrap column for responsive layout

          const card = document.createElement('div');
          card.classList.add('card', 'h-100', 'shadow-sm'); // Bootstrap card

          const cardBody = document.createElement('div');
          cardBody.classList.add('card-body');

          const title = document.createElement('h5');
          title.classList.add('card-title');
          title.textContent = book.title || 'Unknown Title';

          const author = document.createElement('p');
          author.classList.add('card-text');
          author.innerHTML = `<strong>Author:</strong> ${book.author_name ? book.author_name.join(', ') : 'Unknown'}`;

          const year = document.createElement('p');
          year.classList.add('card-text');
          year.innerHTML = `<strong>First Published:</strong> ${book.first_publish_year || 'N/A'}`;

          cardBody.appendChild(title);
          cardBody.appendChild(author);
          cardBody.appendChild(year);
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
});