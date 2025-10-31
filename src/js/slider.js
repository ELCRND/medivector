export class Slider {
  constructor(slider) {
    this.SLIDER = document.querySelector(slider);
    this.WRAPPER = this.SLIDER.querySelector(".slider-wrapper");
    this.LIST = this.SLIDER.querySelector(".slider-list");
    this.PREV = this.SLIDER.querySelector(".slider-btn--prev");
    this.NEXT = this.SLIDER.querySelector(".slider-btn--next");
    this.PAGINATION_CONTAINER = this.SLIDER.querySelector(".slider-pagination");

    this.gap = 0;
    this.slideSize = 0;
    this.totalSlides = 0;
    this.visibleSlides = 0;
    this.currentSlide = 0;
    this.isPagination = false;

    // Swipe variables
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.touchStartY = 0;
    this.touchEndY = 0;
    this.minSwipeDistance = 50; // минимальное расстояние для определения свайпа

    this.handlePrev = () => this.prev();
    this.handleNext = () => this.next();
    this.handleResize = () => this.resize();
    this.handlePagination = (e) => this.pagination(e);

    this.handleTouchStart = (e) => this.touchStart(e);
    this.handleTouchEnd = (e) => this.touchEnd(e);

    this.init();
  }

  get offset() {
    return (this.slideSize + this.gap) * this.currentSlide;
  }

  get isMobile() {
    return window.matchMedia("(max-width: 767px)").matches;
  }

  get isLast() {
    return this.currentSlide >= this.totalSlides - this.visibleSlides;
  }

  get isFirst() {
    return this.currentSlide <= 0;
  }

  init() {
    if (!this.LIST.firstElementChild) {
      console.error("slides not found");
      return;
    }

    this.setSize();
    this.setVisibleSlidesCount();
    this.setGap();
    this.setTotal();

    this.on();
  }

  setSize() {
    this.slideSize = this.LIST.firstElementChild.getBoundingClientRect().width;
  }

  setVisibleSlidesCount() {
    this.visibleSlides = this.getVisibleHorizontalItems(this.LIST);
  }

  setGap() {
    this.gap = parseInt(window.getComputedStyle(this.LIST).gap);
  }

  setTotal() {
    this.totalSlides = this.LIST.childElementCount;
  }

  setPaginationBtns() {
    for (let i = 0; i < this.totalSlides; i++) {
      this.PAGINATION_CONTAINER?.appendChild(this.createPaginationBtn(i));
    }
  }

  createPaginationBtn(idx) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.classList.add("slider-bullet");
    btn.setAttribute("data-pagination", idx);
    btn.ariaLabel = idx + 1 + " слайд";

    if (idx == this.currentSlide) {
      btn.classList.add("slider-bullet--active");
    }

    btn.addEventListener("click", this.handlePagination);

    return btn;
  }

  on() {
    this.PREV.addEventListener("click", this.handlePrev);
    this.NEXT.addEventListener("click", this.handleNext);

    this.LIST.addEventListener("touchstart", this.handleTouchStart, {
      passive: true,
    });
    this.LIST.addEventListener("touchend", this.handleTouchEnd, {
      passive: true,
    });

    window.addEventListener("resize", this.handleResize);

    if (this.isMobile) {
      this.setPaginationBtns();
      this.isPagination = true;
    }
  }

  off() {
    this.PREV.removeEventListener("click", this.handlePrev);
    this.NEXT.removeEventListener("click", this.handleNext);

    this.LIST.removeEventListener("touchstart", this.handleTouchStart);
    this.LIST.removeEventListener("touchend", this.handleTouchEnd);

    window.removeEventListener("resize", this.handleResize);
  }

  touchStart(e) {
    this.touchStartX = e.changedTouches[0].screenX;
    this.touchStartY = e.changedTouches[0].screenY;
  }

  touchEnd(e) {
    this.touchEndX = e.changedTouches[0].screenX;
    this.touchEndY = e.changedTouches[0].screenY;

    this.swipe();
  }

  swipe() {
    const swipeDistanceX = this.touchEndX - this.touchStartX;
    const swipeDistanceY = this.touchEndY - this.touchStartY;

    // Проверяем, что это горизонтальный свайп (вертикальное движение меньше)
    if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY)) {
      if (Math.abs(swipeDistanceX) > this.minSwipeDistance) {
        if (swipeDistanceX > 0) {
          this.prev();
        } else {
          this.next();
        }
      }
    }
  }

  prev() {
    if (this.isFirst) return;

    this.currentSlide--;
    this.update();
    this.checkBlockBtns();
  }

  next() {
    if (this.isLast) return;

    this.currentSlide++;
    this.update();
    this.checkBlockBtns();
  }

  update() {
    this.LIST.style = `translate: -${this.offset}px 0`;

    if (this.isPagination) this.updatePagination();
  }

  resize() {
    this.setVisibleSlidesCount();
    this.setSize();
    this.update();

    if (this.isMobile && !this.PAGINATION_CONTAINER?.childElementCount) {
      this.setPaginationBtns();
      this.isPagination = true;
    } else if (!this.isMobile && this.PAGINATION_CONTAINER?.childElementCount) {
      this.PAGINATION_CONTAINER.replaceChildren();
      this.isPagination = false;
    }
  }

  pagination(e) {
    const idx = e.target.getAttribute("data-pagination");
    if (Number.isNaN(idx)) return;

    this.currentSlide = parseInt(idx);

    this.update();
    this.updatePagination();

    this.checkBlockBtns();
  }

  updatePagination() {
    this.PAGINATION_CONTAINER?.childNodes.forEach((btn, idx) => {
      if (idx == this.currentSlide) {
        btn.classList.add("slider-bullet--active");
      } else {
        btn.classList.remove("slider-bullet--active");
      }
    });
  }

  getVisibleHorizontalItems(container) {
    const containerRect = container.getBoundingClientRect();
    const items = Array.from(container.children);

    return items.filter((item) => {
      const itemRect = item.getBoundingClientRect();

      return (
        itemRect.left >= containerRect.left &&
        itemRect.right <= containerRect.right
      );
    }).length;
  }

  checkBlockBtns() {
    this.PREV.disabled = false;
    this.NEXT.disabled = false;

    if (this.isFirst) {
      this.PREV.disabled = true;
    }
    if (this.isLast) {
      this.NEXT.disabled = true;
    }
  }
}
