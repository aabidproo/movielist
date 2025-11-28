const API_URL = "http://localhost:3000/movies";
const movieListDiv = document.getElementById("movie-list");
const searchInput = document.getElementById("search-input");
const form = document.getElementById("add-movie-form");

let allMovies = [];

// Render movies safely using proper event listeners
function renderMovies(moviesToDisplay) {
  movieListDiv.innerHTML = ""; // ← this line was broken before

  if (moviesToDisplay.length === 0) {
    movieListDiv.innerHTML = "<p>No movies found.</p>";
    return;
  }

  moviesToDisplay.forEach((movie) => {
    const div = document.createElement("div");
    div.className = "movie-item";
    div.dataset.id = movie.id;

    const title = escapeHtml(movie.title || "Unknown");
    const genre = escapeHtml(movie.genre || "N/A");

    div.innerHTML = `
      <p><strong>${title}</strong> (${movie.year || "????"} - ${genre}</p>
      <div>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn" style="background: #d33; color: white; margin-left: 8px;">Delete</button>
      </div>
    `;

    // Proper event attachment (no inline onclick = no errors!)
    div
      .querySelector(".edit-btn")
      .addEventListener("click", () => editMovie(movie.id));
    div
      .querySelector(".delete-btn")
      .addEventListener("click", () => deleteMovie(movie.id));

    movieListDiv.appendChild(div);
  });
}

// Simple & fast HTML escape
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Fetch all movies
function fetchMovies() {
  fetch(API_URL)
    .then((res) => {
      if (!res.ok) throw new Error("Network error");
      return res.json();
    })
    .then((movies) => {
      allMovies = movies;
      renderMovies(allMovies);
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      movieListDiv.innerHTML =
        "<p style='color:red;'>Error: Is json-server running on port 3000?</p>";
    });
}

// Initial load
fetchMovies();

// Live search
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase().trim();
  const filtered = allMovies.filter(
    (m) =>
      (m.title || "").toLowerCase().includes(term) ||
      (m.genre || "").toLowerCase().includes(term)
  );
  renderMovies(filtered);
});

// CREATE
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const genre = document.getElementById("genre").value.trim();
  const year = parseInt(document.getElementById("year").value);

  if (!title || isNaN(year) || year < 1800 || year > 2100) {
    alert("Please enter a valid title and year (1800-2100)");
    return;
  }

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, genre: genre || "Unknown", year }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("POST failed");
      form.reset();
      fetchMovies();
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to add movie");
    });
});

// UPDATE
function editMovie(id) {
  const movie = allMovies.find((m) => m.id === id);
  if (!movie) return alert("Movie not found");

  const newTitle = prompt("New title:", movie.title);
  if (newTitle === null) return;

  const newGenre = prompt("New genre:", movie.genre) || "";
  const newYearStr = prompt("New year:", movie.year);
  if (newYearStr === null) return;

  const newYear = parseInt(newYearStr);
  if (isNaN(newYear)) return alert("Invalid year");

  fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: newTitle.trim() || movie.title,
      genre: newGenre.trim(),
      year: newYear,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Update failed");
      fetchMovies();
    })
    .catch(() => alert("Failed to update"));
}

// DELETE
function deleteMovie(id) {
  if (!confirm("Delete this movie permanently?")) return;

  fetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then((res) => {
      if (!res.ok) throw new Error("Delete failed");
      fetchMovies();
    })
    .catch(() => alert("Failed to delete"));
}
