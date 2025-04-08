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
          data.docs.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.classList.add('box', 'mb-3');
            bookElement.innerHTML = `
              <h3 class="title is-5">${book.title}</h3>
              <p><strong>Author:</strong> ${book.author_name ? book.author_name.join(', ') : 'Unknown'}</p>
              <p><strong>First Published:</strong> ${book.first_publish_year || 'N/A'}</p>
            `;
            resultsContainer.appendChild(bookElement);
          });
        } else {
          resultsContainer.innerHTML = '<p>No results found.</p>';
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        resultsContainer.innerHTML = '<p>Something went wrong. Please try again later.</p>';
      });
  });