import { HeroFilters } from "./hero-filters";

export class MapEvents {
  constructor(apiService) {
    this.apiService = apiService;
    new HeroFilters(apiService, this.displayEvents.bind(this));
    this.currentRegion = null;

    this.CONTAINER = document.querySelector(".hero__events");
    this.CONTAINER_BTN = document.querySelector(".hero__events-close");
    this.OUTPUT = document.querySelector(".hero__events-list");
    this.MORE_BTN = document.querySelector(".hero__text-more");
    this.MORE_COUNTER = this.MORE_BTN.querySelector(".hero__text-counter");
    this.TOOLTIP = document.querySelector(".tooltip");
    this.TOOLTIP_TEXT = document.querySelector(".tooltip__text");
    this.CLEAR = this.TOOLTIP.querySelector(".clear");
    this.CITIES = document.querySelector(".hero__cities");
    this.CITIES_TOGGLE = this.CITIES.querySelector(".hero__cities-toggle");
    this.CITIES_LIST = this.CITIES.querySelectorAll(".district__city");

    this.handleRegionClick = (e) => this.regionClick(e);
    this.handleCityClick = (e) => this.cityClick(e);
    this.handleClear = () => this.clear();
    this.handleToggleSidebar = () => this.toggleSidebar();
    this.handleToggleCitiesList = () => this.toggleCitiesList();

    this.init();
  }

  get isDesktop() {
    return window.matchMedia("(min-width: 1024px)").matches;
  }

  init() {
    const regions = document.querySelectorAll("[data-name]");

    regions.forEach((region) => {
      region.addEventListener("click", this.handleRegionClick);
    });

    this.CLEAR.addEventListener("click", this.handleClear);
    this.CONTAINER_BTN.addEventListener("click", this.handleToggleSidebar);
    this.CITIES_TOGGLE.addEventListener("click", this.handleToggleCitiesList);
    this.CITIES_LIST.forEach((city) => {
      city.addEventListener("click", this.handleCityClick);
    });
  }

  async regionClick(event) {
    const region = event.currentTarget;
    const regionName = region.getAttribute("data-name").toLowerCase();

    this.resetCurrentRegion();
    this.setCurrentRegion(region);

    this.showLoading(regionName);

    try {
      const response = await this.apiService.getEventsByRegion(regionName);

      this.showTooltip(event.clientY, event.clientX, response.name);
      this.displayEvents(response);
    } catch (error) {
      this.showError("Ошибка соединения");
    }
  }

  async cityClick(event) {
    const city = event.currentTarget;
    const cityName = city.getAttribute("data-city").toLowerCase();

    this.resetCurrentRegion();

    this.closeTooltip();

    this.showLoading(cityName);

    this.OUTPUT.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    try {
      const response = await this.apiService.getEventsByCity(cityName);

      this.displayEvents(response);
    } catch (error) {
      console.error(error);
      this.showError(error);
      this.showEmptyOutput();
      this.OUTPUT.innerHTML = `
        <div class="no-events">${error}</div>
        `;
    }
  }

  showTooltip(y, x, text) {
    if (!this.isDesktop) return;

    this.TOOLTIP.classList.add("tooltip--open");
    this.TOOLTIP_TEXT.textContent = text;
    this.TOOLTIP.style = `top:${y}px; left:${x}px`;
  }

  showLoading(regionName) {
    this.OUTPUT.classList.add("hero__events-list--empty");
    this.OUTPUT.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Загрузка мероприятий для ${regionName}...</p>
      </div>
    `;
    // this.showEventsContainer();
  }

  showEmptyOutput() {
    this.OUTPUT.classList.add("hero__events-list--empty");
    this.OUTPUT.textContent = "Выберите регион";
  }

  hideEmptyOutput() {
    this.OUTPUT.classList.remove("hero__events-list--empty");
  }

  openOutputContainer() {
    this.CONTAINER.classList.remove("hero__events--close");
  }

  closeTooltip() {
    this.TOOLTIP.classList.remove("tooltip--open");
  }

  resetCurrentRegion() {
    if (this.currentRegion) {
      this.currentRegion.classList.remove("active");
    }
  }

  setCurrentRegion(region) {
    region.classList.add("active");
    this.currentRegion = region;
  }

  displayEvents(data, b) {
    if (Array.isArray(data)) {
      this.OUTPUT.innerHTML = "";
      this.dispalyManyEvents(data);
      return;
    }

    this.clearMoreCounter();
    this.hideEmptyOutput();
    this.openOutputContainer();

    if (!b) this.OUTPUT.innerHTML = "";

    if (data.cities) {
      for (let i = 0; i < data.cities.length; i++) {
        if (i > 2) {
          this.MORE_COUNTER.classList.remove("hero__text-counter--hide");
          this.MORE_COUNTER.textContent = data.cities.length - 3;
          continue;
        }
        this.OUTPUT.append(this.createEventsCard(data.cities[i]));
      }
    } else {
      this.OUTPUT.append(this.createEventsCard(data));
    }
  }

  dispalyManyEvents(data) {
    if (!data.length) {
      this.showEmptyOutput();
      this.resetCurrentRegion();
      return;
    }

    for (let i = 0; i < data.length; i++) {
      if (i > 2) {
        this.MORE_COUNTER.classList.remove("hero__text-counter--hide");
        this.MORE_COUNTER.textContent = data.length - 3;
        continue;
      }
      this.displayEvents(data[i], true);
    }
    // for (const d of data) {
    //   this.displayEvents(d, true);
    // }
  }

  clearMoreCounter() {
    this.MORE_COUNTER.classList.add("hero__text-counter--hide");
    this.MORE_COUNTER.textContent = "";
  }

  createEventsCard(cityData) {
    for (const e of cityData.events) {
      const card = document.createElement("div");
      card.classList.add("event");

      const time = document.createElement("time");
      time.classList.add("event__time");
      time.setAttribute("datetime", e.date);
      time.textContent = this.formatDate(e.date);

      const desc = document.createElement("p");
      desc.classList.add("event__description");
      desc.textContent = e.description;

      const city = document.createElement("address");
      city.classList.add("event__city");
      city.textContent = cityData.name;

      const icon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      icon.setAttribute("width", "17");
      icon.setAttribute("height", "17");
      icon.setAttribute("viewBox", "0 0 17 17");
      icon.setAttribute("fill", "none");

      const sprite = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "use"
      );
      sprite.setAttribute("href", "#sprite-location");
      icon.append(sprite);

      city.prepend(icon);
      card.append(time, desc, city);

      return card;
    }
  }

  showError(message) {
    // const eventsList = document.getElementById('events-list');
    // this.OUTPUT.innerHTML = `<div class="error">${message}</div>`;
    // this.showEventsContainer();

    console.warn(message);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  clear() {
    this.currentRegion.classList.remove("active");
    this.TOOLTIP.classList.remove("tooltip--open");
    this.TOOLTIP_TEXT.textContent = "";
    this.showEmptyOutput();
    // this.OUTPUT.classList.add("hero__events-list--empty");
  }

  toggleSidebar() {
    this.CONTAINER.classList.toggle("hero__events--close");
  }

  toggleCitiesList() {
    this.CITIES.classList.toggle("hero__cities--close");
  }
}
