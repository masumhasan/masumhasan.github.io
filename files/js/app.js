"use strict";

let page = {
  ScrollMagicController: new ScrollMagic.Controller({}),
};

function NavBar(el, page) {
  this.el = el;
  this.page = page;
  this.menu = document.querySelector("#menu");
  this.menuToggler = document.querySelector("#menu-toggler");
  this.menu_is_open = false;

  this.menuToggler.addEventListener(
    "click",
    function (event) {
      if (this.menu_is_open) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    }.bind(this)
  );

  let ul = document.createElement("ul");

  this.page.sections.forEach(
    function (section, index) {
      let li = document.createElement("li");
      let a = document.createElement("a");
      a.textContent = section.title.querySelector("span").textContent;
      li.append(a);
      ul.append(li);

      a.addEventListener(
        "click",
        function () {
          document.documentElement.scrollTop =
            section.el.offsetTop - this.el.offsetHeight + 1;
          this.closeMenu();
        }.bind(this)
      );
    }.bind(this)
  );

  this.menu.append(ul);

  this.menu.style["transition-duration"] = ".5s";
}

NavBar.prototype.openMenu = function () {
  this.menu.classList.add("open");
  this.menuToggler.classList.add("open");
  this.menu_is_open = true;
};

NavBar.prototype.closeMenu = function () {
  this.menu.classList.remove("open");
  this.menuToggler.classList.remove("open");
  this.menu_is_open = false;
};

function Project(el, section) {
  this.el = el;
  this.section = section;
  this.link = this.el.querySelector("a.parallax-frame");

  // stores ajax fetched data
  this.data = null;

  this.goBackLink = null;
  this.itemEl = null;

  this.fetchData();

  this.link.addEventListener(
    "click",
    function (event) {
      event.preventDefault();

      if (this.data) {
        this.showItem();
      } else {
        this.fetchData().then(
          function () {
            this.showItem();
          }.bind(this)
        );
      }
    }.bind(this)
  );

  this.scenes = {
    horizontal: [],
    vertical: [],
  };
}

Project.prototype.addScrollMagicScenesForHorizontalToSection = function () {
  this.itemEl
    .querySelectorAll(".binarypoets-block-portfolio-item-image.vertical")
    .forEach(
      function (portfolioItemImage, index) {
        let image = portfolioItemImage.querySelector("img");

        let animation = anime.timeline({
          autoplay: false,
          easing: "linear",
        });

        let translateY = [
          0,
          portfolioItemImage.offsetHeight - image.offsetHeight,
        ];

        animation.add({
          targets: image,
          translateY: translateY,
        });

        let scene = new ScrollMagic.Scene({
          triggerElement: portfolioItemImage,
          triggerHook: 1,
          duration: "100%",
        })
          .on("progress", function (event) {
            animation.seek(event.progress * animation.duration);
          })
          .addTo(this.section.ScrollMagicController);

        this.section.scenes.horizontal.push(scene);
        this.scenes.horizontal.push(scene);
      }.bind(this)
    );
};

Project.prototype.removeScrollMagicScenesForHorizontalFromSection =
  function () {
    this.scenes.horizontal.forEach(
      function (scene) {
        let index = this.section.scenes.horizontal.indexOf(scene);
        if (index > -1) {
          this.section.scenes.horizontal.splice(index, 1);
        }
      }.bind(this)
    );
    this.scenes.horizontal = [];
  };

Project.prototype.showItem = function () {
  if (this.section.mode == "horizontal") {
    let animationTimeline = anime.timeline({
      autoplay: false,
      easing: "linear",
    });

    animationTimeline.add({
      targets: this.section.animationBoard,
      left: 0,
      duration: 500,
      begin: function (anim) {
        this.section.animationBoard.style.background = this.color;
        this.itemEl.style.display = "";
        if (this.section.mode == "horizontal") {
          this.addScrollMagicScenesForHorizontalToSection();
        }
      }.bind(this),
      complete: function (anim) {
        this.section.content.style.opacity = 0;
      }.bind(this),
    });

    animationTimeline.add({
      targets: this.itemEl,
      opacity: 1,
      duration: 500,
    });

    animationTimeline.play();
  } else {
    this.itemElVertical.style.display = "block";
  }
};

Project.prototype.hideItem = function () {
  if (this.section.mode == "horizontal") {
    this.removeScrollMagicScenesForHorizontalFromSection();

    let animationTimeline = anime.timeline({
      autoplay: false,
      easing: "linear",
    });

    animationTimeline.add({
      targets: this.section.animationBoard,
      left: "100%",
      duration: 500,
      begin: function (anim) {
        this.itemEl.style.display = "none";
        this.itemEl.style.opacity = 0;
      }.bind(this),
    });

    animationTimeline.add(
      {
        targets: this.section.content,
        opacity: 1,
        duration: 500,
      },
      0
    );

    animationTimeline.play();
  } else {
    this.itemElVertical.style.display = "none";
  }
};

Project.prototype.fetchData = function () {
  return fetch(this.link.href)
    .then((response) => response.text())
    .then(
      function (data) {
        this.data = data;

        let parser = new DOMParser();
        let parsedDoc = parser.parseFromString(this.data, "text/html");

        // Debug: log the fetched URL and check what elements are available
        console.log("Fetching data from:", this.link.href);
        console.log(
          "Available elements in fetched HTML:",
          parsedDoc.querySelectorAll("*").length
        );
        console.log(
          "Body content:",
          parsedDoc.body
            ? parsedDoc.body.innerHTML.substring(0, 200) + "..."
            : "No body found"
        );

        // for horizontal
        this.itemEl = parsedDoc.querySelector(".pagesection__content");

        if (!this.itemEl) {
          // Try alternative selectors that might exist in the fetched content
          this.itemEl =
            parsedDoc.querySelector(".content") ||
            parsedDoc.querySelector("main") ||
            parsedDoc.querySelector(".main-content") ||
            parsedDoc.querySelector("body > div") ||
            parsedDoc.body;

          if (this.itemEl) {
            console.warn(
              "Using fallback element:",
              this.itemEl.className || this.itemEl.tagName
            );
          } else {
            console.error(
              "Could not find .pagesection__content or any fallback content in fetched data"
            );
            console.error(
              "Available classes:",
              Array.from(parsedDoc.querySelectorAll("[class]")).map(
                (el) => el.className
              )
            );
            return;
          }
        }

        this.color = this.itemEl.dataset.color || "#000000"; // Default color if not found
        this.itemEl.style.display = "none";
        this.section.el.append(this.itemEl);
        this.goBackLink = this.itemEl.querySelector("a.go-back");

        if (this.goBackLink) {
          this.goBackLink.addEventListener(
            "click",
            function (event) {
              event.preventDefault();
              this.hideItem();
            }.bind(this)
          );
        }

        this.itemEl.addEventListener(
          "wheel",
          function (event) {
            if (this.section.mode == "horizontal") {
              event.preventDefault();
              if (Math.abs(event.deltaX) > 0) {
                return;
              }
              this.itemEl.scrollLeft += event.deltaY;
            }
          }.bind(this)
        );

        // for vertical
        this.itemElVertical = parsedDoc.querySelector(".pagesection__content");

        if (!this.itemElVertical) {
          // Try the same fallback logic for vertical mode
          this.itemElVertical =
            parsedDoc.querySelector(".content") ||
            parsedDoc.querySelector("main") ||
            parsedDoc.querySelector(".main-content") ||
            parsedDoc.querySelector("body > div") ||
            parsedDoc.body;

          if (this.itemElVertical) {
            console.warn(
              "Using fallback element for vertical mode:",
              this.itemElVertical.className || this.itemElVertical.tagName
            );
          } else {
            console.error(
              "Could not find .pagesection__content or any fallback content in fetched data for vertical mode"
            );
            return;
          }
        }

        this.itemElVertical.style.display = "none";
        this.el.after(this.itemElVertical);
        this.closeLink = this.itemElVertical.querySelector(".close-project");

        if (this.closeLink) {
          this.closeLink.addEventListener(
            "click",
            function (event) {
              event.preventDefault();
              this.hideItem();
            }.bind(this)
          );
        }
      }.bind(this)
    );
};

function Section(el, page) {
  this.el = el;
  this.index = null;
  this.previous = null;
  this.next = null;
  this.activated = false;
  this.rendered = false;
  this.page = page;
  this.width = null;
  this.sectionSwitchTimeout = null;
  this.title = this.el.querySelector(".pagesection__title");
  this.content = this.el.querySelector(".pagesection__content");
  this.lastScrollLeft = 0;
  this.mediaQueryForHorizontalMode = window.matchMedia("(min-width: 1024px)");
  this.mode = null; // horizontal or vertical

  this.ScrollMagicController = new ScrollMagic.Controller({
    container: this.content,
    vertical: false,
  });

  this.scenes = {
    horizontal: [],
    vertical: [],
  };

  this.mediaQueryForHorizontalMode.addListener(
    this.handleMediaQueryChange.bind(this)
  );
  // init based on media query result
  this.handleMediaQueryChange();
}

Section.prototype.handleMediaQueryChange = function (event) {
  if (this.mediaQueryForHorizontalMode.matches) {
    if (this.mode == "horizontal") {
      // doing nothing
    } else {
      if (this.mode == "vertical") {
        // unregister event for vertical
        this.removeScrollMagicScenesForVertical();
      }

      this.registerEventsForHorizontal();
      this.setupScrollMagicScenesForHorizontal();
    }

    this.mode = "horizontal";
  } else {
    if (this.mode == "vertical") {
      // doing nothing
    } else {
      if (this.mode == "horizontal") {
        this.unregisterEventsForHorizontal();
        this.removeScrollMagicScenesForHorizontal();
      }

      //  register event for vertical
      this.setupScrollMagicScenesForVertical();
    }

    this.mode = "vertical";
  }
};

Section.prototype.onResize = function () {
  clearTimeout(this.onResizeTimeout);

  this.onResizeTimeout = setTimeout(
    function () {
      // recalculate the section content width
      this.page.sections.forEach(
        function (section) {
          section.content.style.flexBasis =
            this.page.activatedSection.el.offsetWidth + "px";
        }.bind(this)
      );
    }.bind(this),
    800
  );
};

Section.prototype.onTransitionStart = function () {
  this.wheelfreeze = false;

  // handle accordion title border related class change

  this.ScrollMagicController.enabled(false);
  this.ScrollMagicController.update(true);
};

Section.prototype.onTransitionEnd = function () {
  this.wheelfreeze = false;

  // handle accordion title border related class change
  this.el.classList.remove("pagesection--pending-deactivated");

  if (this.activated) {
    this.ScrollMagicController.enabled(true);
    this.ScrollMagicController.update(true);
  }
};

Section.prototype.onTouchStart = function (event) {
  this.touchPoint = {
    x: event.changedTouches[0].screenX,
    y: event.changedTouches[0].screenY,
  };
};

Section.prototype.onTouchEnd = function (event) {
  let deltaX = event.changedTouches[0].screenX - this.touchPoint.x;

  let forward = deltaX < 0;
  let reverse = deltaX > 0;
};

Section.prototype.onScroll = function (event) {
  let forward = this.content.scrollLeft > this.lastScrollLeft;
  let reverse = this.content.scrollLeft < this.lastScrollLeft;

  if (this.content.scrollLeft == 0 && reverse) {
    this.goToPrevious();
  }

  if (
    Math.ceil(this.content.scrollLeft) >=
      this.content.scrollWidth - this.content.clientWidth &&
    forward
  ) {
    this.goToNext();
  }

  this.lastScrollLeft = this.content.scrollLeft;
};

Section.prototype.onWheel = function (event) {
  if (this.wheelfreeze) return;

  // TODO: ignore the horizontal scroll here
  // TODO: ignore deltaY if deltaX is a lot greater than deltaY, i.e. swipe horizontally
  event.preventDefault();

  if (Math.abs(event.deltaX) > 0) {
    return;
  }

  let forward = event.deltaY > 0;
  let reverse = event.deltaY < 0;

  this.content.scrollLeft += event.deltaY;
};

Section.prototype.setupScrollMagicScenesForVertical = function () {
  // TODO: build sticky section title with ScrollMagic here
  let scene = new ScrollMagic.Scene({
    triggerElement: this.title,
    triggerHook: "onLeave",
    offset: -49,
    duration: function () {
      return this.content.offsetHeight;
    }.bind(this),
  })
    .setPin(this.title, { pushFollowers: false })
    .addTo(this.page.ScrollMagicController);

  scene.on("enter", function (event) {
    event.target.triggerElement().style.borderTop = "none";
  });

  scene.on("leave", function (event) {
    event.target.triggerElement().style.borderTop = "1px solid #000";
  });

  this.scenes.vertical.push(scene);
};

Section.prototype.removeScrollMagicScenesForVertical = function () {
  this.scenes.vertical.forEach(function (scene, index) {
    scene.destroy(true);
  });
};

Section.prototype.setupScrollMagicScenesForHorizontal = function () {
  this.el.querySelectorAll(".binarypoets-block-team-members").forEach(
    function (teamMembersBlock, index) {
      let nextSection = teamMembersBlock.nextElementSibling;
      let previousSection = teamMembersBlock.previousElementSibling;
      let parentNode = teamMembersBlock.parentNode;
      let triggerElement;

      if (nextSection) {
        let teamMembersBlockAndNextSection = document.createElement("div");
        teamMembersBlockAndNextSection.classList.add(
          "binarypoets-block-team-members-and-sibling"
        );

        teamMembersBlockAndNextSection.style.width =
          teamMembersBlock.offsetWidth + nextSection.offsetWidth + "px";
        teamMembersBlockAndNextSection.append(teamMembersBlock);
        teamMembersBlockAndNextSection.append(nextSection);

        if (previousSection) {
          previousSection.after(teamMembersBlockAndNextSection);
        } else {
          parentNode.append(teamMembersBlockAndNextSection);
        }

        triggerElement = teamMembersBlockAndNextSection;
      } else {
        triggerElement = teamMembersBlock;
      }

      let teamMembersBlockPaddingTop =
        parseInt(getComputedStyle(teamMembersBlock)["padding-top"]) || 0;
      let pagesectionContent = teamMembersBlock.closest(
        ".pagesection__content"
      );
      let pagesectionContentPaddingTop =
        parseInt(getComputedStyle(pagesectionContent)["padding-top"]) || 0;
      let totalPaddingTop =
        pagesectionContentPaddingTop + teamMembersBlockPaddingTop;

      let members = teamMembersBlock.querySelectorAll(".member");
      let lastMember = members[members.length - 1];
      let lastMemberBoundingClientRect = lastMember.getBoundingClientRect();
      let member = teamMembersBlock.querySelector(".member");

      let memberHeight = member.offsetHeight;
      let memberMarginBottom =
        parseInt(getComputedStyle(member)["margin-bottom"]) || 0;

      let translateY = [
        0,
        -(
          totalPaddingTop +
          memberHeight * members.length +
          memberMarginBottom * (members.length - 1) -
          window.innerHeight
        ),
      ];

      let animation = anime.timeline({
        autoplay: false,
        easing: "linear",
      });

      animation.add({
        targets: teamMembersBlock.querySelector(".members"),
        translateY: translateY,
      });

      let scene = new ScrollMagic.Scene({
        triggerElement: triggerElement,
        triggerHook: 0.2,
        duration: window.innerWidth * 1.5,
      })
        .setPin(triggerElement)
        .on("progress", function (event) {
          animation.seek(event.progress * animation.duration);
        })
        .on("start", function (event) {})
        .on("end", function (event) {})
        .addTo(this.ScrollMagicController);

      this.scenes.horizontal.push(scene);
    }.bind(this)
  );

  this.el.querySelectorAll(".binarypoets-block-picture").forEach(
    function (pictureBlock, index) {
      let image = pictureBlock.querySelector("img");

      let animation = anime.timeline({
        autoplay: false,
        easing: "linear",
      });

      animation.add({
        targets: image,
        translateX: [-1000, 0],
      });

      // create a scene for each pictureBlock's image element
      let scene = new ScrollMagic.Scene({
        triggerElement: pictureBlock,
        triggerHook: "onEnter",
        // if this set to window.innerWidth, it will cause strange behavior for event.progress
        // the value of the event.progress will bump back and forth
        // if this set to window.innerWidth * 0.67, it will resolve the bump back and forth issue
        // but it still can't get the initial scene.progress right
        duration: "100%",
      }).addTo(this.ScrollMagicController);

      scene.on("progress", function (event) {
        animation.seek(event.progress * animation.duration);
      });

      this.scenes.horizontal.push(scene);
    }.bind(this)
  );

  this.el.querySelectorAll(".binarypoets-block-projects__project").forEach(
    function (projectBlock, index) {
      let image = projectBlock.querySelector("img");

      let animation = anime.timeline({
        autoplay: false,
        easing: "linear",
      });

      animation.add({
        targets: image,
        translateX: [-0, 0],
      });

      let scene = new ScrollMagic.Scene({
        triggerElement: projectBlock,
        triggerHook: "onEnter",
        duration: "100%",
      }).addTo(this.ScrollMagicController);

      scene.on("progress", function (event) {
        animation.seek(event.progress * animation.duration);
      });

      this.scenes.horizontal.push(scene);
    }.bind(this)
  );

  this.el.querySelectorAll(".binarypoets-block-blog-posts__post").forEach(
    function (postBlock, index) {
      let image = postBlock.querySelector("img");

      let animation = anime.timeline({
        autoplay: false,
        easing: "linear",
      });

      animation.add({
        targets: image,
        translateX: [-300, 0],
      });

      let scene = new ScrollMagic.Scene({
        triggerElement: postBlock,
        triggerHook: "onEnter",
        duration: "100%",
      }).addTo(this.ScrollMagicController);

      scene.on("progress", function (event) {
        animation.seek(event.progress * animation.duration);
      });

      this.scenes.horizontal.push(scene);
    }.bind(this)
  );
};

Section.prototype.removeScrollMagicScenesForHorizontal = function () {
  this.scenes.horizontal.forEach(function (scene, index) {
    scene.destroy(true);
  });

  // use setTimeout to do it otherwise it will conflict with the scene.destroy process
  // and remove all children elements but the first.
  setTimeout(function () {
    // remove .binarypoets-block-team-members-and-sibling and restore its children
    let wrappers = document.querySelectorAll(
      ".binarypoets-block-team-members-and-sibling"
    );
    wrappers.forEach(function (wrapper, index) {
      let children = wrapper.children;
      for (let i = children.length; i--; i > 0) {
        wrapper.after(children[i]);
      }
      wrapper.remove();
    });
  }, 100);
};

Section.prototype.registerEventsForHorizontal = function () {
  this.onTransitionEndHandler = this.onTransitionEnd.bind(this);
  this.el.addEventListener("transitionend", this.onTransitionEndHandler);

  this.onTransitionStartHandler = this.onTransitionStart.bind(this);
  this.el.addEventListener("transitionstart", this.onTransitionStartHandler);

  this.activateHandler = this.activate.bind(this);
  this.title.addEventListener("click", this.activateHandler);

  this.onTouchStartHandler = this.onTouchStart.bind(this);
  this.content.addEventListener("touchstart", this.onTouchStartHandler);

  this.onWheelHandler = this.onWheel.bind(this);
  this.content.addEventListener("wheel", this.onWheelHandler);

  this.onResizeHandler = this.onResize.bind(this);
  window.addEventListener("resize", this.onResizeHandler);
};

Section.prototype.unregisterEventsForHorizontal = function () {
  this.el.removeEventListener("transitionend", this.onTransitionEndHandler);
  this.title.removeEventListener("click", this.activateHandler);
  this.content.removeEventListener("touchstart", this.onTouchStartHandler);
  this.content.removeEventListener("touchend", this.onTouchEndHandler);
  this.content.removeEventListener("scroll", this.onScrollHandler);
  this.content.removeEventListener("wheel", this.onWheelHandler);
  window.removeEventListener("resize", this.onResizeHandler);
};

Section.prototype.getWidth = function () {
  if (!this.width) {
    // TODO: calculate section width based on the number of sections
  } else {
    return this.width;
  }
};

Section.prototype.getContentHeight = function () {
  return this.content.offsetHeight;
};

Section.prototype.isFirst = function () {
  return this.previous == null;
};

Section.prototype.isLast = function () {
  return this.next == null;
};

Section.prototype.isActivated = function () {
  return this.el.classList.contains("pagesection--activated");
};

Section.prototype.goToNext = function () {
  if (this.next) {
    this.wheelfreeze = true;

    // as long as greater than 1000/60 ms
    setTimeout(
      function () {
        this.next.title.click();
      }.bind(this),
      20
    );
  }
};

Section.prototype.goToPrevious = function () {
  if (this.previous) {
    this.wheelfreeze = true;

    // as long as greater than 1000/60 ms
    setTimeout(
      function () {
        this.previous.title.click();
      }.bind(this),
      20
    );
  }
};

Section.prototype.activate = function () {
  if (document.querySelector(".pagesection--pending-deactivated")) {
    return;
  }

  if (!this.activated) {
    for (let i = 0; i < this.page.sections.length; i++) {
      if (i != this.index) {
        this.page.sections[i].deactivate();
      }
    }

    this.activated = true;
    this.el.classList.add("pagesection--activated");
    this.el.style.flexGrow = 1;

    page.activatedSection = this;
    // TODO: handle border related class change
  }
};

Section.prototype.deactivate = function () {
  this.el.classList.remove("pagesection--activated");
  this.el.style.flexGrow = 0;

  // handle accordion title border related class change
  if (this.activated) {
    this.el.classList.add("pagesection--pending-deactivated");
  }

  this.activated = false;
};

function init() {
  document.querySelectorAll("a.section-link").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      let sectionIndex = this.dataset["sectionIndex"];
      if (sectionIndex) {
        page.sections[sectionIndex].activate();
      }
    });
  });

  let sectionElements = document.querySelectorAll(".pagesection");
  page.sections = [];

  sectionElements.forEach(function (sectionElement, index) {
    let section = new Section(sectionElement, page);
    section.index = index;
    page.sections.push(section);
    if (section.isActivated()) {
      section.content.style.flexGrow = 1;
      section.activated = true;
      page.activatedSection = section;
    }

    if (section.el.querySelector(".binarypoets-block-projects")) {
      // initialize projects here
      section.el
        .querySelectorAll(".binarypoets-block-projects__project")
        .forEach(function (projectElement, index) {
          let project = new Project(projectElement, section);
        });

      let animationBoard = document.createElement("div");
      animationBoard.classList.add("animation-board");
      section.content.before(animationBoard);
      section.animationBoard = animationBoard;
    }
  });

  for (let i = 0; i < page.sections.length; i++) {
    let previous = page.sections[i - 1];
    let next = page.sections[i + 1];

    if (previous) {
      page.sections[i].previous = previous;
    }

    if (next) {
      page.sections[i].next = next;
    }
  }

  let navbarElement = document.querySelector("#navigation");
  page.navbar = new NavBar(navbarElement, page);

  // pre-render the section content to prevent layout shake for horizontal, should move to horizontal related section
  if (page.sections[0].mode == "horizontal") {
    page.sections.forEach(function (section, index) {
      setTimeout(function () {
        page.sections.forEach(function (thesection) {
          // if ( thesection === section ) {
          //   thesection.el.style.flexGrow = 1;
          // } else {
          //   thesection.el.style.flexGrow = 0;
          // }

          thesection.el.style.flexGrow = 0;
        });

        section.el.style.flexGrow = 1;

        setTimeout(function () {
          section.ScrollMagicController.update(true);
          section.ScrollMagicController.enabled(false);
        }, 100);
      }, index * 200);
    });

    setTimeout(function () {
      page.sections.forEach(function (section) {
        section.el.style["transition-duration"] = "0.8s";
        section.el.style.flexGrow = 1;
      });
    }, 2000);
  }

  if (document.querySelector("html").classList.contains("loading")) {
    let loadingAnimationTimeline = anime.timeline({
      autoplay: false,
      easing: "linear",
    });

    let navigation = document.querySelector("#navigation");
    let pageSections = document.querySelectorAll(".pagesection");

    if (page.sections.length > 0) {
      if (page.sections[0].mode == "horizontal") {
        loadingAnimationTimeline.add({
          targets: navbarElement,
          translateX: ["-100%", 0],
          duration: 1300,
        });

        loadingAnimationTimeline.add({
          targets: pageSections,
          translateY: ["-100%", 0],
          duration: 650,
          complete: function (anim) {
            document
              .querySelectorAll(".pagesection")
              .forEach(function (pageSection) {
                pageSection.style.width = pageSection.offsetWidth + "px";
                pageSection.style.flexGrow = 0;

                // don't use timeline for the following animation
                // because the flex-grow for the .pagesection elements
                // are conflict with the pre-render method
                // don't know the reason
                anime({
                  targets: pageSections,
                  easing: "linear",
                  width: 48,
                  duration: 800,
                  begin: function (anim) {
                    page.sections.forEach(function (section) {
                      // section.el.style.flexGrow = 1;
                    });
                  },
                  complete: function (anim) {
                    document
                      .querySelectorAll(".pagesection__content")
                      .forEach(function (pageContent) {
                        pageContent.style.visibility = "visible";
                      });
                    document.querySelector("#logo").style.opacity = 1;
                    document.querySelector("#menu-toggler").style.opacity = 1;
                    document
                      .querySelectorAll(".pagesection__title span")
                      .forEach(function (span) {
                        span.style.opacity = 1;
                      });

                    setTimeout(function () {
                      document
                        .querySelector("html")
                        .classList.remove("loading");
                      page.sections[0].activate();

                      // unset all styles set during loading
                      page.sections.forEach(function (section) {
                        section.el.style.width = "";
                        section.el.style.transform = "";
                      });
                    }, 10);
                  },
                });
              });
          },
        });
      } else {
        // handle loading animation for mobile

        loadingAnimationTimeline.add({
          targets: document.querySelector("#main"),
          translateX: ["-100%", 0],
          duration: 850,
          complete: function (anim) {
            document.querySelector("#main").style.transform = "none";

            let navigation = document.querySelector("#navigation");
            navigation.style.height = navigation.offsetHeight + "px";
            navigation.style.flex = "0 0 auto";
            document
              .querySelectorAll(".pagesection")
              .forEach(function (pageSection, index) {
                pageSection.style.height = pageSection.offsetHeight + "px";
                pageSection.style.flex = "0 0 auto";
              });
          },
        });

        loadingAnimationTimeline.add({
          targets: navigation,
          height: "49px",
          duration: 650,
        });

        loadingAnimationTimeline.add(
          {
            targets: pageSections,
            height: "47px",
            duration: 650,
            complete: function (anim) {
              document.querySelector("#main").style.display = "block";
              document
                .querySelectorAll(".pagesection__title span")
                .forEach(function (span) {
                  span.style.opacity = 1;
                });
              document.querySelector("#logo").style.opacity = 1;
              document.querySelector("#menu-toggler").style.opacity = 1;
            },
          },
          "-=600"
        );

        loadingAnimationTimeline.add({
          targets: pageSections[0],
          height: "100vh",
          duration: 650,
          easing: "linear",
          begin: function (anim) {
            pageSections.forEach(function (section, index) {
              section.querySelector(".pagesection__content").style.visibility =
                "visible";
              section.querySelector(".pagesection__content").style.height =
                "auto";
              section.querySelector(".pagesection__title").style.borderBottom =
                "1px solid #000";
            });
          },
          complete: function (anim) {
            // unset all styles set during loading
            pageSections.forEach(function (pageSection, index) {
              pageSection.style.height = "";
              pageSection.style.transform = "";
              pageSection.style.flex = "";
              pageSection.querySelector(".pagesection__content").style.height =
                "";
              pageSection.querySelector(
                ".pagesection__title"
              ).style.borderBottom = "";
              document.querySelector("#main").style.display = "";
            });
            document.querySelector("html").classList.remove("loading");
          },
        });
      }
    }

    setTimeout(function () {
      loadingAnimationTimeline.play();
    }, 1000);
  } else {
    page.sections[0].activate();
  }
}

window.addEventListener("DOMContentLoaded", init);

jQuery(document).ready(function ($) {
  var $contact_forms = $("form.binarypoets_contact_form");

  for (var i = 0; i < $contact_forms.length; i++) {
    $($contact_forms[i]).validate({
      messages: {},
      submitHandler: function (form) {
        $.ajax({
          type: "POST",
          url: "send.php",
          data: $(form).serialize(),
          success: function (data) {
            if (data.match(/success/)) {
              $(form).trigger("reset");
              $(form).find("p.thanks").removeClass("hide").show().fadeOut(5000);
            }
          },
        });
        return false;
      },
    });
  }
});
