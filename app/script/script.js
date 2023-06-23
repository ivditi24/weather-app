const API_KEY = `24fcac7cceeca75afb7dda587c4743be`;

const nav = document.querySelector("[data-nav]");
const close_nav_btn = document.querySelector("[data-close]");
const open_nav_btn = document.querySelector("[data-nav-btn]");

const city_input = document.querySelector("[data-search-input]");
const search_btn = document.querySelector("[data-search-btn]");

const celsius_btn = document.querySelector("[data-celsius]");
const farenheit_btn = document.querySelector("[data-farenheit]");

async function showDefaultWeather() {
  const weather_info = await getWeather("Tbilisi");
  displayCurrentWeather(weather_info.current, "Tbilisi");
  displayForecast(weather_info.daily, "Tbilisi");
}

showDefaultWeather();

async function search() {
  const city = city_input.value;
  if (!city) return;

  const weather_info = await getWeather(city);

  if (data.current) {
    displayCurrentWeather(weather_info.current, city);
    displayForecast(weather_info.daily, city);
    closeSearch();
  } else {
    return;
  }
}

function displayForecast(data) {
  const forecast_container = document.querySelector("[data-forecast]");
  const five_day = data.slice(0, 5);

  forecast_container.innerHTML = five_day
    .map((day) => {
      const [day_next, month, date] = unixToDate(day.dt);

      const unit_active = farenheit_btn.classList.contains("active")
        ? "f"
        : "c";

      const day_temp_value =
        unit_active === "f" ? celsiusToF(day.temp.day) : day.temp.day;
      const night_temp_value =
        unit_active === "f" ? celsiusToF(day.temp.night) : day.temp.night;

      const unit_value = unit_active === "f" ? "F" : "C";

      return `<div class="forecast__cards-card">
                 <p class="forecast__cards-card__date">${day_next} ${month} ${date}</p>
                <div class="forecast__cards-card__icon">
                    <img src="https://openweathermap.org/img/wn/${
                      day.weather[0].icon
                    }@2x.png" alt="" />
                </div>
                <div class="forecast__cards-card__time">
                    <span class="forecast__cards-card__time-day">${Math.floor(
                      day_temp_value
                    )}&deg;${unit_value}</span>
                    <span class="forecast__cards-card__time-night">${Math.floor(
                      night_temp_value
                    )}&deg;${unit_value}</span>
                </div>
        </div>;`;
    })
    .join("");
}

function displayCurrentWeather(data, city, unit = "c") {
  const temp = document.querySelector("[data-temp]");
  const description = document.querySelector("[data-description");
  const wind = document.querySelector("[data-wind]");
  const humidity = document.querySelector("[data-humidity]");
  const visibility = document.querySelector("[data-visibility]");
  const pressure = document.querySelector("[data-pressure]");
  const img = document.querySelector("[data-icon");
  const humidity_bar = document.querySelector("[data-bar]");
  const unit_elem = document.querySelector("[data-unit]");

  humidity_bar.style.width = `${(230 * data.humidity) / 100}px`;

  const img_url = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

  img.src = img_url;

  const temp_value =
    unit === "f" || farenheit_btn.classList.contains("active")
      ? celsiusToF(data.temp)
      : data.temp;
  const unit_value =
    unit === "f" || farenheit_btn.classList.contains("active")
      ? "&deg;F"
      : "&deg;C";

  unit_elem.innerHTML = unit_value;
  temp.textContent = Math.floor(temp_value);
  description.textContent = data.weather[0].description;
  wind.textContent = data.wind_speed;
  visibility.textContent = data.visibility;
  humidity.textContent = data.humidity;
  pressure.textContent = data.pressure;

  const [day, month, date] = unixToDate(data.dt, city);

  const city_date = document.querySelector("[data-more]");
  city_date.innerHTML = `<div>
                            Today • ${day} ${month}.${date}
                          <div data-city>
                            ${city[0].toUpperCase()}${city.slice(1)}
                            <i class="fa-solid fa-location-dot"></i>
                        </div>`;
}

async function getWeather(city) {
  let data = null;
  try {
    const city_location = await getCityGeoCoordinates(city);
    const { lat, lon } = city_location[0];
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=hourly,minutely,alerts&appid=${API_KEY}`;
    const response = await fetch(url);
    data = await response.json();
  } catch (err) {
    console.log(err);
  }

  return data;
}

async function getCityGeoCoordinates(city) {
  let data = null;
  try {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${API_KEY}`;
    const response = await fetch(url);
    data = await response.json();
  } catch (err) {
    console.log(err);
  }

  return data;
}
function unixToDate(timestamp) {
  const get_date = new Date(timestamp * 1000);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const month = get_date.getMonth();
  const day = get_date.getDay();
  const date = get_date.getDate();

  const res = [days[day], months[month], date];
  return res;
}

function celsiusToF(val) {
  return val * (9 / 5) + 35;
}

//Open--Close Nav
function openSearch() {
  nav.classList.add("open");
}
function closeSearch() {
  city_input.textContent = "";
  nav.classList.remove("open");
}

open_nav_btn.addEventListener("click", () => openSearch());
close_nav_btn.addEventListener("click", () => closeSearch());

search_btn.addEventListener("click", () => search());

farenheit_btn.addEventListener("click", () => changeUnit("f"));
celsius_btn.addEventListener("click", () => changeUnit("c"));

//TOGGLE UNITS

async function changeUnit(unit) {
  const city = document.querySelector("[data-city]").textContent;
  const weather_info = await getWeather(city);

  if (unit === "c") {
    farenheit_btn.classList.remove("active");
    celsius_btn.classList.add("active");
  } else {
    farenheit_btn.classList.add("active");
    celsius_btn.classList.remove("active");
  }

  displayCurrentWeather(weather_info.current, city, unit);
  displayForecast(weather_info.daily, unit);
}
