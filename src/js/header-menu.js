export class HeaderMenu {
  constructor() {
    this.MENU = document.querySelector(".header__menu");
    this.MENU_BTN = document.querySelector(".header__menu-btn");
    this.NAV_ITENS = this.MENU.querySelectorAll(".header__navigation-item");

    this.handleOpen = () => this.open();
    this.handleClose = () => this.close();

    this.init();
  }

  init() {
    this.on();
  }

  on() {
    this.MENU_BTN.addEventListener("click", this.handleOpen);
    this.NAV_ITENS.forEach((i) =>
      i.addEventListener("click", this.handleClose)
    );
  }
  off() {
    this.MENU_BTN.removeEventListener("click", this.handleOpen);
    this.NAV_ITENS.forEach((i) =>
      i.removeEventListener("click", this.handleClose)
    );
  }

  open() {
    this.MENU.classList.toggle("header__menu--open");
    this.MENU_BTN.classList.toggle("header__menu-btn--open");
  }

  close() {
    this.MENU.classList.remove("header__menu--open");
    this.MENU_BTN.classList.remove("header__menu-btn--open");
  }
}
