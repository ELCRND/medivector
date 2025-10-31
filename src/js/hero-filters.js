export class HeroFilters {
  constructor(apiService, displayEvents) {
    this.apiService = apiService;
    this.displayEvents = displayEvents;
    this.DISTRICTS_FILTERS = document.querySelector(".hero__filters-district");
    this.CITIES_FILTERS = document.querySelector(".hero__filters-city");
    this.DISTRICTS_FILTERS_OPEN = document.querySelector(
      ".filters-district-open"
    );
    this.DISTRICTS_FILTERS_CLOSE = document.querySelector(
      ".filters-district-close"
    );
    this.CITIES_FILTERS_OPEN = document.querySelector(".filters-city-open");
    this.CITIES_FILTERS_CLOSE = document.querySelector(".filters-city-close");
    this.OUTPUT_CITIES = document.querySelector(".city-filter");
    this.OUTPUT_CITIES_DISTRICT_NAME = document.querySelector(".district-name");

    this.cities = new Map();
    this.isRebuild = false;
    this.selectedDistrict = "";

    this.handleOpenDistrcitsFilters = () => this.openDistrcitsFilters();
    this.handleCloseDistrcitsFilters = () => this.closeDistrcitsFilters();
    this.handleSubmitDistrict = (e) => this.submitDistrict(e);
    this.handleResetDistrict = (e) => this.resetDistrict(e);
    this.handleOpenCityFilters = () => this.openCityFilters();
    this.handleCloseCityFilters = () => this.closeCityFilters();
    this.handleSubmitCity = (e) => this.submitCity(e);
    this.handleResetCity = (e) => this.resetCity(e);

    this.init();
  }

  init() {
    this.DISTRICTS_FILTERS_OPEN.addEventListener(
      "click",
      this.handleOpenDistrcitsFilters
    );
    this.DISTRICTS_FILTERS_CLOSE.addEventListener(
      "click",
      this.handleCloseDistrcitsFilters
    );
    this.DISTRICTS_FILTERS.addEventListener(
      "submit",
      this.handleSubmitDistrict
    );
    this.DISTRICTS_FILTERS.addEventListener("reset", this.handleResetDistrict);

    this.CITIES_FILTERS_OPEN.addEventListener(
      "click",
      this.handleOpenCityFilters
    );
    this.CITIES_FILTERS_CLOSE.addEventListener(
      "click",
      this.handleCloseCityFilters
    );
    this.CITIES_FILTERS.addEventListener("submit", this.handleSubmitCity);
    this.CITIES_FILTERS.addEventListener("reset", this.handleResetCity);

    window.addEventListener("resize", () => {
      if (window.innerWidth < 1024 && !this.isRebuild) {
        this.rebuild();
      }
    });

    if (window.innerWidth < 1024 && !this.isRebuild) {
      this.rebuild();
    }
  }

  rebuild() {
    this.isRebuild = true;
    this.createDistrictFilter();
    this.createCityFilter();
  }

  createDistrictFilter() {
    const districtFilter = document.querySelector(".district-filter");

    document.querySelectorAll(".district__title").forEach((el) => {
      const key = el.getAttribute("data-district");
      const name = this.apiService.getDistrictFullName(key);

      districtFilter.innerHTML += `
        <div class="filter">
       <input type="radio" name="district" id="${key}" class="filter__input" value="${key}">
        <label for="${key}"  class="filter__label">${name}</label>
        </div>
       `;
    });
  }

  createCityFilter() {
    document.querySelectorAll(".district__city").forEach((el) => {
      const key = el.getAttribute("data-city");

      const name = this.apiService.getCitiesName(key);

      const city = getHtmlString(key, name);

      this.cities.set(key, city);
    });

    this.setHtml(this.OUTPUT_CITIES, [...this.cities.values()].join(""));

    function getHtmlString(key, name) {
      return `<div class="filter">
            <input type="checkbox" name="${key}" id="${key}" class="filter__input">
            <label for="${key}"  class="filter__label">${name}</label>
        </div>`;
    }
  }

  setHtml(output, str) {
    output.innerHTML = str;
  }

  openDistrcitsFilters() {
    this.DISTRICTS_FILTERS.classList.remove("hero__filters-district--close");
    document.body.classList.add("is-lock");
  }

  closeDistrcitsFilters() {
    this.DISTRICTS_FILTERS.classList.add("hero__filters-district--close");
    document.body.classList.remove("is-lock");
  }

  submitDistrict(e) {
    e.preventDefault();

    const formData = new FormData(this.DISTRICTS_FILTERS);

    const params = new URLSearchParams();

    for (const d of formData) {
      params.append("district", formData.get(d[0]));
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);

    this.closeDistrcitsFilters();
  }

  resetDistrict() {
    if (window.location.search) {
      const newUrl = window.location.pathname + window.location.hash;
      window.history.pushState({}, "", newUrl);
    }
  }

  openCityFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("district");

    if (query && this.selectedDistrict !== query) {
      this.OUTPUT_CITIES_DISTRICT_NAME.textContent =
        this.apiService.getDistrictFullName(query);
      this.selectedDistrict = query;
      const filteredCities = this.apiService.getCityByDistrictId(query);

      const newCities = [];
      filteredCities.forEach((c) => {
        newCities.push(this.cities.get(c.id));
      });

      this.setHtml(this.OUTPUT_CITIES, newCities.join(""));
    } else if (!query) {
      this.OUTPUT_CITIES_DISTRICT_NAME.textContent = "Все";
      this.selectedDistrict = "";
      this.setHtml(this.OUTPUT_CITIES, [...this.cities.values()].join(""));
    }

    this.CITIES_FILTERS.classList.remove("hero__filters-city--close");
    document.body.classList.add("is-lock");
  }

  closeCityFilters() {
    this.CITIES_FILTERS.classList.add("hero__filters-city--close");
    document.body.classList.remove("is-lock");
  }

  submitCity(e) {
    e.preventDefault();

    const formData = new FormData(this.CITIES_FILTERS);
    const params = new URLSearchParams(window.location.search);
    const selectedCities = [];

    for (const [id, value] of formData) {
      params.append("city", id);

      selectedCities.push(this.apiService.getCityById(id));
    }
    this.displayEvents(selectedCities);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);

    this.closeCityFilters();
  }

  resetCity() {
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      params.delete("city");

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, "", newUrl);
    }
  }
}
