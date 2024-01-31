"use strict";

// VARIABLES
const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

// WORKOUT
class Workout {
    date = new Date();
    idWorkout = (Date.now + "").slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }

    _setWorkoutDesc() {
        const months = ["January", "February", "March", "April", "May", "Jun", "July", "August", "September", "October", "November", "December"];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

// RUNNING FROM WORKOUT
class Running extends Workout {
    type = "running";

    constructor(coords, distance, duration, cadance) {
        super(coords, distance, duration);
        this.cadance = cadance;
        this.calcPace();
        this._setWorkoutDesc();
    }

    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

// CYCLING FROM WORKOUT
class Cycling extends Workout {
    type = "cycling";

    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setWorkoutDesc();
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

// APP
class App {
    #map;
    #mapZoom = 13;
    #workouts = [];
    #mapEvent;

    constructor() {
        this._getPosition();
        inputType.addEventListener("change", this._toggleCyclingForm.bind(this));
        form.addEventListener("submit", this._newWorkout.bind(this));
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
        
        // Display Form
        this.#map.on("click", this._showForm.bind(this));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE; // contains lat & lng information
        form.classList.remove("hidden");
        inputDistance.focus();
    }

    _hideForm() {
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";
        form.classList.add("hidden");
    }

    _toggleCyclingForm() {
        inputElevation.closest(".form__input-group").classList.toggle("form__input-group--hidden");
        inputCadence.closest(".form__input-group").classList.toggle("form__input-group--hidden");
    }

    _newWorkout(e) {
        e.preventDefault();
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat, lng} = this.#mapEvent.latlng;
        let workout;

        const validInputs = (...inputs) => 
            inputs.every(input => 
                Number.isFinite(input) && 
                input > 0);

        if(type === "running") {
            const cadance = +inputCadence.value;

            if(!validInputs(duration, distance, cadance)) {return  alert("Inputs have to be positive numbers!") };

            workout = new Running([lat, lng], distance, duration, cadance);
            console.log(workout);
        }

        if(type === "cycling") {
            const elevationGain = +inputElevation.value;

            if(!validInputs(duration, distance, elevationGain)) {return  alert("Inputs have to be positive numbers!") };

            workout = new Cycling([lat, lng], distance, duration, elevationGain);
            console.log(workout);
        }

        this.#workouts.push(workout);

        this._renderWorkoutMarker(workout);
        
        this._renderWorkout(workout);

        this._hideForm();
    }

    _renderWorkoutMarker(workout) {
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 260,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`
                })
            )
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
            .openPopup();
    }

    _renderWorkout(workout) {
        const html = `
            <li class="workout ${workout.type === "running" ? "workout--running" : "workout--cycling"}" data-id="">
                <h2 class="workout-title">${workout.description}</h2>
                <div class="workout__details">
                    <div class="workout__detail">
                        <span class="workout__icon">${workout.type === "running" ? "🏃‍♂️" : "🚴"}</span>
                        <span class="workout__value">${workout.distance}</span>
                        <span class="workout__unit">km</span>
                    </div>
                    <div class="workout__detail">
                        <span class="workout__icon">⏱</span>
                        <span class="workout__value">${workout.duration}</span>
                        <span class="workout__unit">min</span>
                    </div>
                    <div class="workout__detail">
                        <span class="workout__icon">⚡</span>
                        <span class="workout__value">${workout.type === "running" ? workout.pace.toFixed(1) : workout.speed.toFixed(1)}
                        </span>
                        <span class="workout__unit">${workout.type === "running" ? "min/km" : "km/h"}</span>
                    </div>
                    <div class="workout__detail">
                        <span class="workout__icon">${workout.type === "running" ? "🦶" : "⛰"}</span>
                        <span class="workout__value">${workout.type === "running" ? workout.cadance : workout.elevationGain}</span>
                        <span class="workout__unit">${workout.type === "running" ? "spm" : "m"}</span>
                    </div>
                </div>
                <button class="btn--delete">✖</button>
            </li>
        `
        form.insertAdjacentHTML("afterend", html);
    }
}
const app =  new App();