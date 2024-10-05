window.requestAnimationFrame = window.requestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.msRequestAnimationFrame;

var width, height, starCount, circleRadius, circleCenter, 
    starDensity = .216, speedCoeff = .05, first = !0, 
    giantColor = "180,184,240", starColor = "226,225,142", 
    cometColor = "226,225,224", canva = document.querySelector(".vh-bg"), 
    stars = [];

function create_vh_starry_sky() {
    VH_STARRY_SKY = canva.getContext("2d");
    for (var t = 0; t < starCount; t++) {
        stars[t] = new Star();
        stars[t].reset();
    }
    draw();
}

function draw() {
    VH_STARRY_SKY.clearRect(0, 0, width, height);
    for (var t = stars.length, i = 0; i < t; i++) {
        var e = stars[i];
        e.move();
        e.fadeIn();
        e.fadeOut();
        e.draw();
    }
    window.requestAnimationFrame(draw);
}

function Star() {
    this.reset = function() {
        this.giant = getProbability(3);
        this.comet = !this.giant && !first && getProbability(10);
        this.x = getRandInterval(0, width - 10);
        this.y = getRandInterval(0, height);
        this.r = getRandInterval(1.1, 2.6);
        this.dx = getRandInterval(speedCoeff, 6 * speedCoeff) + 
            (this.comet + 1 - 1) * speedCoeff * 
            getRandInterval(50, 120) + 2 * speedCoeff;
        this.dy = -getRandInterval(speedCoeff, 6 * speedCoeff) - 
            (this.comet + 1 - 1) * speedCoeff * 
            getRandInterval(50, 120);
        this.fadingOut = null;
        this.fadingIn = !0;
        this.opacity = 0;
        this.opacityTresh = getRandInterval(.2, 1 - .4 * (this.comet + 1 - 1));
        this.do = getRandInterval(5e-4, .002) + .001 * (this.comet + 1 - 1);
    };

    this.fadeIn = function() {
        this.fadingIn && (this.fadingIn = !(this.opacity > this.opacityTresh), 
            this.opacity += this.do);
    };

    this.fadeOut = function() {
        this.fadingOut && (this.fadingOut = !(this.opacity < 0), 
            this.opacity -= this.do / 2, 
            (this.x > width || this.y < 0) && (this.fadingOut = !1, 
                this.reset()));
    };

    this.draw = function() {
        if (VH_STARRY_SKY.beginPath(), this.giant) {
            VH_STARRY_SKY.fillStyle = "rgba(" + giantColor + "," + this.opacity + ")";
            VH_STARRY_SKY.arc(this.x, this.y, 2, 0, 2 * Math.PI, !1);
        } else if (this.comet) {
            VH_STARRY_SKY.fillStyle = "rgba(" + cometColor + "," + this.opacity + ")";
            VH_STARRY_SKY.arc(this.x, this.y, 1.5, 0, 2 * Math.PI, !1);
            for (var t = 0; t < 30; t++) {
                VH_STARRY_SKY.fillStyle = "rgba(" + cometColor + "," + 
                    (this.opacity - this.opacity / 20 * t) + ")";
                VH_STARRY_SKY.rect(this.x - this.dx / 4 * t, 
                    this.y - this.dy / 4 * t - 2, 2, 2);
                VH_STARRY_SKY.fill();
            }
        } else {
            VH_STARRY_SKY.fillStyle = "rgba(" + starColor + "," + this.opacity + ")";
            VH_STARRY_SKY.rect(this.x, this.y, this.r, this.r);
        }
        VH_STARRY_SKY.closePath();
        VH_STARRY_SKY.fill();
    };

    this.move = function() {
        this.x += this.dx;
        this.y += this.dy;
        !1 === this.fadingOut && this.reset();
        (this.x > width - width / 4 || this.y < 0) && (this.fadingOut = !0);
    };

    setTimeout(function() {
        first = !1;
    }, 50);
}

function getProbability(t) {
    return Math.floor(1e3 * Math.random()) + 1 < 10 * t;
}

function getRandInterval(t, i) {
    return Math.random() * (i - t) + t;
}

function windowResizeHandler() {
    width = window.innerWidth;
    height = window.innerHeight;
    starCount = width * starDensity;
    circleRadius = width > height ? height / 2 : width / 2;
    circleCenter = { x: width / 2, y: height / 2 };
    canva.setAttribute("width", width);
    canva.setAttribute("height", height);
}

windowResizeHandler();
window.addEventListener("resize", windowResizeHandler, !1);
create_vh_starry_sky();
