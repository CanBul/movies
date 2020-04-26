const movieList = document.getElementById("all-movies");
const searchBox = document.getElementById("search-box");
const closeBtn = document.getElementById("closeBtn");
const modal = document.getElementById("modal");
const myMovies = document.getElementById("my-movies-list");
const searchImage = document.getElementById("image");
const leftArrow = document.getElementById("arrow-left");
const rightArrow = document.getElementById("arrow-right");
const leftArrow1 = document.getElementById("arrow-left1");
const rightArrow1 = document.getElementById("arrow-right1");
const getRecommendation = document.getElementById("get-btn");
//---------------------------------------------------
// Get movies from local file
get_movies();
let allMovieList = [];

function get_movies() {
  return fetch("data/movies.json")
    .then((res) => res.json())
    .then((data) =>
      data.forEach((element) => {
        allMovieList.push(element);
      })
    );
}
//---------------------------------------------------
//Searchbox with recommendation
searchBox.addEventListener("keyup", () => filterMovies(searchBox.value));

function filterMovies(argument) {
  const matches = allMovieList.filter((element) => {
    let movieName = element.title.toUpperCase();

    if (movieName.includes(argument.toUpperCase()) == true) {
      return element;
    }
  });

  if (argument.length == 0) {
    movieList.innerHTML = "";
  } else {
    Output(matches);
  }
}

function Output(match) {
  let output = "";
  let movieName = "";
  for (let index = 0; index < Math.min(match.length, 10); index++) {
    output += `<div id='${match[index].imdb_id}' class='movies sudo'><h4 class='sudo'>${match[index].title} <small class='sudo'>(${match[index].year})</small></h4></div>`;
  }

  movieList.innerHTML = output;
  let movie = document.querySelectorAll(".movies");
  movie.forEach((x) => {
    x.addEventListener("click", (e) => showRating(e));
  });
  document.addEventListener("click", close); //close search
}
//Close when clicked outside of searchbar
function close() {
  movieList.innerHTML = "";

  document.removeEventListener("click", close);
}

//---------------------------------------------------
//Show Modal for rating movies

function showRating(e) {
  //clean eventlistener for closing search when clicked outside, searchbox value and search recommendation
  document.removeEventListener("click", close);
  searchBox.value = "";
  movieList.innerHTML = "";
  //clean starform eventlisteners
  const starForm = document.getElementById("star-form");
  starsClone = starForm.cloneNode(true);
  starForm.parentElement.replaceChild(starsClone, starForm);
  //get movie id (it is defined as parent div ID.)
  let movieId;
  const tagName = e.target.tagName;

  if (tagName == "DIV") {
    movieId = e.target.id;
  } else if (e.target.parentElement.tagName == "H4") {
    movieId = e.target.parentElement.parentElement.id;
  } else {
    movieId = e.target.parentElement.id;
  }
  showModal(movieId);
}
function showModal(movieId) {
  //get selected movie
  let movieToDisplay = allMovieList.filter(
    (element) => element.imdb_id == movieId
  );
  // Show modal with ratings
  document.getElementById(
    "movie-rate"
  ).innerHTML = `<h2 style="color: brown;">Please rate the movie ${movieToDisplay[0].title}</h2>`;
  //Give every star an event listener
  const stars = document.getElementsByName("stars");
  stars.forEach((element) =>
    element.addEventListener("click", (e) => {
      getStar(e, movieToDisplay[0]);
    })
  );
  //show modal
  modal.style.display = "block";
}
//Event listener for closing modal
closeBtn.addEventListener("click", closeModal);
function closeModal() {
  modal.style.display = "none";
}

//Get star from User and Add it to both local storage and UI.

function getStar(e, movie) {
  //replace star-form with a clone to removed event listeners
  const starForm = document.getElementById("star-form");
  starsClone = starForm.cloneNode(true);
  starForm.parentElement.replaceChild(starsClone, starForm);

  const temp = Store.getMovies();
  let tempBoolean = true;
  for (let index = 0; index < temp.length; index++) {
    if (temp[index].imdb_id == movie.imdb_id) {
      tempBoolean = false;
    }
  }
  //don't add if it's already in the list
  if (tempBoolean) {
    const newObject = new myMovieList(
      movie.imdb_id,
      movie.title,
      e.target.value
    );

    UI.addMovie(newObject);
    Store.addMovie(newObject);
  }
  closeModal();

  for (let index = 0; index < 10; index++) {
    document.getElementsByName("stars")[index].checked = null;
  }
}
//---------------------------------------------------
//movie, UI and Store classes
class myMovieList {
  constructor(imdb_id, title, rating) {
    this.imdb_id = imdb_id;
    this.title = title;
    this.rating = rating;
  }
}

class Store {
  static getMovies() {
    let storeMovies;

    if (localStorage.getItem("storedMovies") === null) {
      storeMovies = [];
    } else {
      storeMovies = JSON.parse(localStorage.getItem("storedMovies"));
    }
    return storeMovies;
  }
  static addMovie(movie) {
    const storeMovies = this.getMovies();

    storeMovies.push(movie);
    localStorage.setItem("storedMovies", JSON.stringify(storeMovies));
  }
  static removeMovie(imdb_id) {
    const storeMovies = this.getMovies();
    const newMovieList = storeMovies.filter(
      (element) => element.imdb_id != imdb_id
    );
    localStorage.setItem("storedMovies", JSON.stringify(newMovieList));
  }
  static updateRating(imdb_id, rating) {
    const storeMovies = this.getMovies();
    const newMovieList = storeMovies.map((element) => {
      if (element.imdb_id == imdb_id) {
        element.rating = rating;
        return element;
      } else {
        return element;
      }
    });
    localStorage.setItem("storedMovies", JSON.stringify(newMovieList));
  }
}

class UI {
  static showMovies() {
    const movie = Store.getMovies();
    movie.forEach((element) => UI.addMovie(element));
  }
  static addMovie(movie) {
    const newTr = document.createElement("tr");
    newTr.id = movie.imdb_id;

    newTr.innerHTML = `<td>${movie.title}</td> <td class="middle-column" contenteditable='true'>${movie.rating}</td><td><a class="delete">X</a></td>`;
    myMovies.appendChild(newTr);
  }

  static removeMovie(el) {
    if (el.classList.contains("delete")) {
      el.parentElement.parentElement.remove();
    }
  }
}
//---------------------------------------------------
//Show movies at the start
document.addEventListener("DOMContentLoaded", UI.showMovies);

//---------------------------------------------------
//Remove Movies when clicked X and change rating
myMovies.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete")) {
    UI.removeMovie(e.target);

    Store.removeMovie(e.target.parentElement.parentElement.id);
  } else if (e.target.classList.contains("middle-column")) {
    e.target.style.color = "white";
    e.target.style.backgroundColor = "rgb(82, 4, 4)";
    let temp_value = e.target.textContent;
    e.target.addEventListener("focusout", (e) => {
      e.target.style.color = "";
      e.target.style.backgroundColor = "";

      if (
        isNaN(parseInt(e.target.textContent)) ||
        parseInt(e.target.textContent) > 10 ||
        parseInt(e.target.textContent) < 1
      ) {
        e.target.textContent = temp_value;
      } else {
        e.target.textContent = parseInt(e.target.textContent);
        temp_value = parseInt(e.target.textContent);
        Store.updateRating(e.target.parentElement.id, temp_value);
      }
    });
  }
});
//---------------------------------------------------
// pressing the search button
searchImage.addEventListener("click", (e) => search(e));

function search(e) {
  if (movieList.firstElementChild == null) {
    alert("Please type to find movies!");
  } else {
    showModal(movieList.firstElementChild.id);
  }
}
//---------------------------------------------------
//Show more movies when arrow is clicked
leftArrow.addEventListener("click", () => {
  let recommendations = document.getElementById("recommendation").children;

  for (let index = recommendations.length - 1; index > -1; index -= 2) {
    if (recommendations[index].style.display == "none") {
      recommendations[index].style.display = "";
      recommendations[index - 1].style.display = "";

      break;
    }
  }
});

leftArrow1.addEventListener("click", () => {
  let recommendations = document.getElementById("recommendation2").children;

  for (let index = recommendations.length - 1; index > -1; index -= 2) {
    if (recommendations[index].style.display == "none") {
      recommendations[index].style.display = "";
      recommendations[index - 1].style.display = "";

      break;
    }
  }
});

rightArrow.addEventListener("click", () => {
  let recommendations = document.getElementById("recommendation").children;

  for (let index = 0; index < recommendations.length - 4; index += 2) {
    if (recommendations[index].style.display != "none") {
      recommendations[index].style.display = "none";
      recommendations[index + 1].style.display = "none";

      break;
    }
  }
});
rightArrow1.addEventListener("click", () => {
  let recommendations = document.getElementById("recommendation2").children;

  for (let index = 0; index < recommendations.length - 4; index += 2) {
    if (recommendations[index].style.display != "none") {
      recommendations[index].style.display = "none";
      recommendations[index + 1].style.display = "none";

      break;
    }
  }
});
//---------------------------------------------------
// send my movies to server
getRecommendation.addEventListener("click", () => {
  document.getElementById("rec-container").style.display = "grid";
  document.getElementById("rec-container1").style.display = "grid";
  document.getElementById("show").style.display = "block";

  getRecommendationFromServer();
});

function getRecommendationFromServer() {
  let sendData = [];

  Array.from(myMovies.children).forEach((element) => {
    let temp = {};
    temp["id"] = element.id;
    temp["rating"] = parseInt(element.children[1].textContent);

    sendData.push(temp);
  });

  fetch("http://34.91.133.210/flask", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-type": "application/json",
    },
    body: JSON.stringify(sendData),
  })
    .then((res) => res.json())
    .then((data) => getPostersAndShow(data));

  //Funk API
  fetch("http://34.91.133.210/funk", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-type": "application/json",
    },
    body: JSON.stringify(sendData),
  })
    .then((res) => res.json())
    .then((data) => getPostersAndShow2(data));
}

function getPostersAndShow(data) {
  let container = document.getElementById("recommendation");
  container.innerHTML = "";

  //get posters and add it to container

  data.forEach((element) => {
    fetch(
      `https://api.themoviedb.org/3/movie/${element[0]}?api_key=f764605e3fcf27766c7a6bd316f18450&language=en-US`
    )
      .then((res) => res.json())
      .then((data) => {
        var img = new Image();
        img.src = "http://image.tmdb.org/t/p/w342" + data.poster_path;
        container.appendChild(img);
      });
  });
}

//FUNK Function
function getPostersAndShow2(data) {
  let container = document.getElementById("recommendation2");
  container.innerHTML = "";

  //get posters and add it to container
  let counter = 0;
  for (let index = 0; index < 30; index++) {
    fetch(
      `https://api.themoviedb.org/3/movie/${data[index]}?api_key=f764605e3fcf27766c7a6bd316f18450&language=en-US`
    ).then((res) => {
      if (res.status == 404) {
        res.json().then((a) => console.log(1));
      } else if (res.status == 200) {
        res.json().then((data) => {
          var img = new Image();
          img.src = "http://image.tmdb.org/t/p/w342" + data.poster_path;
          container.appendChild(img);
        });
      }
    });
  }
}
