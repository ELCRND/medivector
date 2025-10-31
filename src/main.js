import { MedicalEventsAPI } from "./js/api-service";
import { HeaderMenu } from "./js/header-menu";
import { HeroFilters } from "./js/hero-filters";
import { MapEvents } from "./js/map-events";
import { Slider } from "./js/slider";
import "./scss/main.scss";

document.addEventListener("DOMContentLoaded", () => {
  new HeaderMenu();

  new MedicalEventsAPI().init().then((res) => {
    if (!res) return;
    // new HeroFilters(res);
    new MapEvents(res);
  });

  new Slider(".soon__events");

  const options = {
    rootMargin: "0px",
    scrollMargin: "0px",
    threshold: 0.25,
  };

  const callback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("about__container--visible");
      }
    });
  };

  const observer = new IntersectionObserver(callback, options);
  const t = document.querySelector(".about__container");
  observer.observe(t);

  new Slider(".news");
  new Slider(".reviews__content");
});
