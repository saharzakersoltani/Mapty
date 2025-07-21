'use strict';
// NOTE: I have refactored all of my source code to OOP by creating a Class.

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//////////////////////////////////////////////////////////
// CLASS WORKOUT
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lng, lat]
    this.distance = distance; // km
    this.duration = duration; // min
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.calcSpeed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycle1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1);
// console.log(cycle1);

//////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
class App {
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevetion.bind(this));
  }

  _getPosition() {
    // Using the Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position!');
        }
      );
    }
  }

  _loadMap(position) {
    // console.log(position);
    const { longitude } = position.coords;
    const { latitude } = position.coords;
    // console.log(`https://www.google.com/maps/@${longitude},${latitude},10z`);

    const coords = [longitude, latitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    // console.log(map);

    // Handling clicks on map (see the form when clicking on the map)
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevetion(e) {
    // Change type of form
    e.preventDefault();
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    //  Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const cadence = +inputCadence.value;
    const elevation = +inputElevation.value;

    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPossitive = (...inputs) => inputs.every(inp => inp > 0);

    // If workout running, create running object
    if (type === 'running') {
      // Check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPossitive(distance, duration, cadence)
      )
        return alert('Inputs have to be possitive numbers!');
    }

    // If workout cycling, create cycling object
    if (type === 'cycling') {
      // Check if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPossitive(distance, duration)
      )
        return alert('Inputs have to be possitive numbers!');
    }
    // Add new object to workout array

    // render workout on map as marker
    // Display marker (submitting form and then see the workout on the map)
    console.log(this.#mapEvent);
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          className: 'running-popup',
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent('Workout')
      .openPopup();
    // Render workout on list

    // Hide form + Clear input fields
    e.preventDefault();
    // Clear input fields
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }
}

const app = new App();

// When we start the program, first 'app' will be load and then immediatly the constructor function will be called. So because of this reason we put every function that we want to be run from the object into the constructor. We could write them out of the 'App' class too. But in order to have a better code we wrote them inside the 'App' class.
