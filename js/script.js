import { setupDateInputs } from './dateRange.js';

// Select elements
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const button = document.querySelector('.filters button'); // ensures it connects to your button

// Initialize date inputs
setupDateInputs(startInput, endInput);

// Your NASA API key
const API_KEY = 'idbKIdA8Joj6nsbxhvjeav361wBaoU6FFPs9xKX0';

// Listen for button clicks
button.addEventListener('click', async () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Validate input
  if (!startDate || !endDate) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">⚠️</div>
        <p>Please select both a start and end date.</p>
      </div>
    `;
    return;
  }

  // Show loading state
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🚀</div>
      <p>Loading images from NASA...</p>
    </div>
  `;

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error('Failed to fetch NASA data');
    const data = await res.json();

    // Sort by date
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Clear gallery
    gallery.innerHTML = '';

    // Display images only
    let imageCount = 0;
    data.forEach(item => {
      if (item.media_type === 'image') {
        imageCount++;
        const div = document.createElement('div');
        div.classList.add('gallery-item');
        div.innerHTML = `
          <img src="${item.url}" alt="${item.title}" data-title="${item.title}" data-date="${item.date}" data-explanation="${item.explanation}">
          <p><strong>${item.title}</strong><br>${item.date}</p>
        `;
        gallery.appendChild(div);
      }
    });

    // Handle case: no images
    if (imageCount === 0) {
      gallery.innerHTML = `
        <div class="placeholder">
          <div class="placeholder-icon">🛰️</div>
          <p>No images available for this date range.</p>
        </div>
      `;
    }

    setupModal();

  } catch (err) {
    console.error(err);
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">⚠️</div>
        <p>Error loading data from NASA. Please try again later.</p>
      </div>
    `;
  }
});

// Setup image modal
function setupModal() {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.style.display = 'none';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <img id="modalImage" src="" alt="">
      <h2 id="modalTitle"></h2>
      <p id="modalDate"></p>
      <p id="modalExplanation"></p>
    </div>
  `;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector('#modalImage');
  const modalTitle = modal.querySelector('#modalTitle');
  const modalDate = modal.querySelector('#modalDate');
  const modalExp = modal.querySelector('#modalExplanation');
  const closeBtn = modal.querySelector('.close');

  gallery.addEventListener('click', e => {
    const img = e.target.closest('img');
    if (!img) return;
    modal.style.display = 'flex';
    modalImg.src = img.src;
    modalTitle.textContent = img.dataset.title;
    modalDate.textContent = img.dataset.date;
    modalExp.textContent = img.dataset.explanation;
  });

  closeBtn.addEventListener('click', () => (modal.style.display = 'none'));
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });
}
