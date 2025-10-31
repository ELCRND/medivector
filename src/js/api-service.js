export class MedicalEventsAPI {
  constructor() {
    this.eventsData = [];
    this.districtsNames = new Map();
    this.citiesNames = new Map();
    this.subjects = new Map();
    this.cities = new Map();
    this.citiesByName = new Map();
    this.citiesByDistrcit = new Map();
  }

  async init() {
    try {
      const res = await fetch("/events.json");
      const data = await res.json();

      this.eventsData = data.districts;
    } catch (e) {
      console.log(e, "Не удалость загрузить json файл");
      this.eventsData = [];
    }

    this.eventsData.forEach((d) => {
      this.districtsNames.set(d.id, d.name);

      d.subjects.forEach((s) => {
        this.subjects.set(s.id, s);

        s.cities.forEach((c) => {
          this.cities.set(c.id, c);
          this.citiesByName.set(c.name, c);

          if (this.citiesByDistrcit.has(d.id)) {
            const q = this.citiesByDistrcit.get(d.id);
            q.push(c);
            this.citiesByDistrcit.set(d.id, q);
          } else {
            this.citiesByDistrcit.set(d.id, []);
          }
        });
      });
    });

    return this;
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getEventsByRegion(regionName) {
    await this.delay(300 + Math.random() * 700);

    return this.subjects.get(regionName);
  }

  async getEventsByCity(regionName) {
    await this.delay(300 + Math.random() * 700);

    return this.cities.get(regionName);
  }

  // Вспомогательная функция для генерации городов для регионов без данных
  getRandomCityForRegion(regionName) {
    const cityTemplates = [
      "Областной центр",
      "Крупный город региона",
      "Административный центр",
      "Городской округ",
    ];

    return `${
      cityTemplates[Math.floor(Math.random() * cityTemplates.length)]
    } ${regionName}`;
  }

  // Получение всех мероприятий (для отладки)
  async getAllEvents() {
    await this.delay(500);
    return {
      success: true,
      data: this.eventsData,
    };
  }

  getDistrictFullName(id) {
    return this.districtsNames.get(id);
  }

  getCityById(id) {
    return this.cities.get(id);
  }

  getCityByDistrictId(id) {
    return this.citiesByDistrcit.get(id);
  }

  getCityByName(name) {
    return this.citiesByName.get(name);
  }

  getCitiesName(id) {
    if (!id) return;
    return this.cities.get(id)?.name;
  }
}
