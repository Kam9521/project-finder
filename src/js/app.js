"use strict";


import { select, classNames } from "./settings.js";

import Home from "./components/Home.js";
import Finder from "./components/Finder.js";

const app = {
  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages);

    thisApp.navLinks = document.querySelectorAll(select.containerOf.navLinks);

    const pages = thisApp.pages.children;

    const idFromHash = window.location.hash.replace("#/", "");

    let pageMatchingHash = pages[0].id;

    for (let page of pages) {
      if (page.id === idFromHash) {
        pageMatchingHash = page.id;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener("click", function (event) {
        event.preventDefault();

        const clickedElement = this;

        const id = clickedElement.getAttribute("href").replace("#/", "");

        thisApp.activatePage(id);

        window.location.hash = "#/" + id;
      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;

    const pages = thisApp.pages.children;

    for (let page of pages) {
      page.classList.toggle(classNames.pages.active, page.id === pageId);
    }

    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute("href") === "#/" + pageId,
      );
    }
  },

  initHome: function () {
    const thisApp = this;

    const homeElement = document.querySelector(select.pages.home);

    thisApp.home = new Home(homeElement);
  },

  initFinder: function () {
    const thisApp = this;

    const finderElement = document.querySelector(select.pages.finder);

    thisApp.finder = new Finder(finderElement);
  },

  init: function () {
    const thisApp = this;

    thisApp.initPages();
    thisApp.initHome();
    thisApp.initFinder();
    
  },
};

app.init();
