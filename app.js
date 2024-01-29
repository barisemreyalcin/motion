"use strict";

// VARIABLES
const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

// APP
class App {
    #map;
    #mapZoom = 13;
    #workouts = [];
    #mapEvent;

    constructor() {
        this._getPosition();
    }

    _getPosition() {
        if(!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            this._loadMap.bind(this),
            () => alert("We couldn't get your position!")
        );
    }

    // navigator.geolocation.getCurrentPosition(...)
    _loadMap(position) {
        const {latitude, longitude} = position.coords;
        const coords = [latitude, longitude];

        // Set position
        this.#map = L.map("map").setView(coords, this.#mapZoom);

        // Map image
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // Marker on the map
        L.marker(coords).addTo(this.#map)
            .bindPopup('Workout Position')
            .openPopup();
        
        // Display Form
        this.#map.on("click", this._showForm.bind(this));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE; // contains lat & lng information
        form.classList.remove("hidden");
        inputDistance.focus();
    }
}
const app =  new App();