function defineProp(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

class Game {
  constructor() {
    defineProp(this, "state", {
      score: 0,
      isRunning: false,
      intervalId: null,
      moveInterval: null,
      refreshRate: 1000,
      scoreElement: document.getElementById("score"),
      gameBtn: document.getElementById("game-btn"),
      speedElement: document.getElementById("speed"),
      gameSpeedLabel: document.getElementById("speed-label"),
      top_navElement: document.getElementById("top_nav"),
    });

    defineProp(this, "setState", (obj) => {
      this.state = { ...this.state, ...obj };
    });

    defineProp(this, "getMovingRefreshRate", () =>
      Math.floor(this.state.refreshRate / this.getDotSpeed())
    );

    defineProp(this, "getDotSpeed", () =>
      parseInt(this.state.speedElement.value, 10)
    );

    defineProp(this, "setGameSpeed", () => {
      const { gameSpeedLabel } = this.state;
      gameSpeedLabel.innerHTML = `Game Speed: ${this.getDotSpeed()}`;
    });

    defineProp(this, "togglePlay", () => {
      let {
        gameBtn,
        isRunning,
        refreshRate,
        intervalId,
        moveInterval,
        top_navElement,
      } = this.state;

      if (isRunning) {
        this.updateToggleButton(gameBtn, "Start", "start", "pause");
        top_navElement.classList.add("paused");
        this.setState({
          isRunning: false,
        });
        clearInterval(intervalId);
        clearInterval(moveInterval);
      } else {
        this.updateToggleButton(gameBtn, "Pause", "pause", "start");
        top_navElement.classList.remove("paused");
        this.setState({
          isRunning: true,
          intervalId: setInterval(this.addDot, refreshRate),
          moveInterval: setInterval(
            this.animateDots,
            this.getMovingRefreshRate()
          ),
        });
      }
    });

    defineProp(this, "addDot", () => {
      const dot = new Dot(this.getDotSpeed).makeDot();
      dot.addEventListener("click", this.dotOnClick);
      main_game.appendChild(dot);
    });

    defineProp(this, "deleteDot", (dot) =>
      dot.parentNode.removeChild(dot)
    );

    defineProp(this, "dotOnClick", (event) => {
      const { target } = event;
      const { isRunning } = this.state;
      const dotValue = parseInt(target.getAttribute("data-value"), 10);
     

      if (isRunning) {
        setTimeout(() => {
          this.setScore(dotValue);
          this.deleteDot(target);
        }, 0);
      }
    });

    defineProp(this, "setScore", (value) => {
      let { score, scoreElement } = this.state;
      const updatedScore = score + value;
      this.setState({
        score: updatedScore,
      });
      scoreElement.innerHTML = `My Score: ${updatedScore} Points!`;
    });

    defineProp(this, "animateDots", () => {
      const main_gameHeight = document.getElementById("main_game")
        .offsetHeight;
      document.querySelectorAll(".dot").forEach((dot) => {
        const positionY = parseInt(dot.style.top, 10),
          shift = positionY + 1;
        if (positionY > main_gameHeight) this.deleteDot(dot);
        dot.style.top = `${shift}px`;
      });
    });

    defineProp(
      this,
      "updateToggleButton",
      (button, label, classToAdd, classToRemove) => {
        button.innerHTML = label;
        button.classList.add(classToAdd);
        button.classList.remove(classToRemove);
      }
    );

    let { gameBtn: _gameBtn, speedElement } = this.state;
    this.setScore(0);
    this.setGameSpeed();

    _gameBtn.addEventListener("click", this.togglePlay);

    speedElement.addEventListener("change", () => {
      const { moveInterval } = this.state;
      this.setGameSpeed();
      clearInterval(moveInterval);

      if (this.state.isRunning) {
        const interval = setInterval(
          this.animateDots,
          this.getMovingRefreshRate()
        );
        this.setState({
          moveInterval: interval,
        });
      }
    });
  }
}

class Dot {
  constructor(getDotSpeed) {
    defineProp(this, "min_dot_size", 10);
    defineProp(this, "max_dot_size", 100);
    defineProp(this, "dot_gradients", [
      "(#ff0000, #eee)", // red
      "(#0000ff, #eee)", // blue
      "(#00ff00, #eee)", // green
      "(#8f00ff, #eee)", // violet
      "(#ffff00, #eee)", // yellow
    ]);
    defineProp(this, "gradient_type", "radial-gradient");

    defineProp(this, "getDotValue", (diameter) => 11 - diameter * 0.1);

    defineProp(
      this,
      "getRandomDotSize",
      () =>
        Math.round(
          (Math.random() * (this.max_dot_size - this.min_dot_size) + this.min_dot_size) / 10
        ) * 10
    );

    defineProp(
      this,
      "getRandomNum",
      (min, max) => Math.floor(Math.random() * (max - min)) + min
    );

    defineProp(this, "getRandomGradient", () => {
      return (
        this.gradient_type +
        this.dot_gradients[Math.floor(Math.random() * this.dot_gradients.length)]
      );
    });

    const maxWidth = window.innerWidth - this.max_dot_size;
    const dotSize = this.getRandomDotSize();
    const dotValue = this.getDotValue(dotSize);
    const dotLeft = this.getRandomNum(0, maxWidth);
    const dotTop = 0 - dotSize - getDotSpeed();
    this.dot = document.createElement("div");
    this.dot.setAttribute("class", "dot");
    this.dot.setAttribute("data-size", dotSize);
    this.dot.setAttribute("data-value", dotValue);
    this.dot.style.width = `${dotSize}px`;
    this.dot.style.height = `${dotSize}px`;
    this.dot.style.top = dotTop + "px";
    this.dot.style.left = dotLeft + "px";
    this.dot.style["background-image"] = this.getRandomGradient();
  }

  makeDot() {
    return this.dot;
  }
}

document.addEventListener("DOMContentLoaded", () => new Game());
