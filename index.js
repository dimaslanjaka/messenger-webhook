/*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const getSearchParams = () => new Map(window.location.hash.slice(1).split('&').map(x => x.split('=')));

const { h, app } = window.hyperapp;

const randPlusMinus = n => Math.random() * n - n/2;

const mkMidpoints = points => {
  const newPoints = [];
  for (let i = 0; i < points.length*2 -1; i++) {
    if (i % 2 === 0) {
      newPoints[i] = points[i/2];
    } else {
      newPoints[i] = (points[(i-1)/2] + points[(i+1)/2]) / 2 + randPlusMinus(50/points.length);
    }
  }
  return newPoints;
}

class PointGenerator {
  constructor() {
    this.points = this.generatePoints();
    this.newPointSize = this.points.length;
    this.sliceSize = this.newPointSize * 3;
    this.slice = [0, this.sliceSize];
    for (let i = 0; i < 3; i++) {
      this.points = this.points.concat(this.generatePoints(this.points[this.points.length - 1]));
    }
    this.visiblePoints = this.points.slice(...this.slice);
  }
  generatePoints(start) {
    const iterations = 8;
    let points = [start || Math.random() * 15 + 30, Math.random() * 15 + 30];
    for (let i = 0; i < iterations; i++) {
      points = mkMidpoints(points);
    }
    return points;
  }
  tick() {
    if (this.slice[0] >= this.newPointsSize) {
      this.slice = [0, this.sliceSize];
      this.points = state.points.map(points => [
        ...points.slice(this.newPointsSize),
        ...this.generatePoints(this.points[this.points.length-1]),
      ]);
    } else {
      this.slice = this.slice.map(x => x + 1); 
    }
    this.visiblePoints = this.points.slice(...this.slice);
    return this;
  }
}


const arrayToD = points => {
  const parts = ['M', '-125,200'];
  for (const i in points) {
    parts.push(`${i * 350 / (points.length - 1) - 125},${points[i] + 25}`);
  }
  parts.push([225,200]);
  return parts.join(' ');
};

const mountainRange = (fill, points) => h('path', {fill, d: arrayToD(points)}, []);

const nightLumOffset = () => {
  const sunRatio = getSunRatio()
  const night = sunRatio < 0 || sunRatio > 1;
  return night ? 40 : 0;
};

const generateMountainRanges = (points, hue) => {
  const sunRatio = getSunRatio();
  const night = sunRatio < 0 || sunRatio > 1;
  const [sMin, sMax] = [50, 80];
  const [lMin, lMax] = night ? [0, 15] : [30, 50];
  const ranges = [];
  for (const i in points) {
    const s = sMin + (sMax - sMin) / points.length * i;
    const l = lMax - (lMax - lMin) / points.length * i * (night?-1:1);
    ranges.push(mountainRange(`hsl(${hue}, ${s}%, ${l}%)`, points[i].map(p=>p+i*2)));
  }
  return ranges;
};



// cribbed from https://gist.github.com/Tafkas/4742250
function computeSunrise(day, sunrise) {

    /*Sunrise/Sunset Algorithm taken from
        http://williams.best.vwh.net/sunrise_sunset_algorithm.htm
        inputs:
            day = day of the year
            sunrise = true for sunrise, false for sunset
        output:
            time of sunrise/sunset in hours */

    //lat, lon for Washington, DC, USA
    var longitude = -77.0250356;
    var latitude = 38.908975;
    var zenith = 90.83333333333333;
    var D2R = Math.PI / 180;
    var R2D = 180 / Math.PI;

    // convert the longitude to hour value and calculate an approximate time
    var lnHour = longitude / 15;
    var t;
    if (sunrise) {
        t = day + ((6 - lnHour) / 24);
    } else {
        t = day + ((18 - lnHour) / 24);
    };

    //calculate the Sun's mean anomaly
    M = (0.9856 * t) - 3.289;

    //calculate the Sun's true longitude
    L = M + (1.916 * Math.sin(M * D2R)) + (0.020 * Math.sin(2 * M * D2R)) + 282.634;
    if (L > 360) {
        L = L - 360;
    } else if (L < 0) {
        L = L + 360;
    };

    //calculate the Sun's right ascension
    RA = R2D * Math.atan(0.91764 * Math.tan(L * D2R));
    if (RA > 360) {
        RA = RA - 360;
    } else if (RA < 0) {
        RA = RA + 360;
    };

    //right ascension value needs to be in the same qua
    Lquadrant = (Math.floor(L / (90))) * 90;
    RAquadrant = (Math.floor(RA / 90)) * 90;
    RA = RA + (Lquadrant - RAquadrant);

    //right ascension value needs to be converted into hours
    RA = RA / 15;

    //calculate the Sun's declination
    sinDec = 0.39782 * Math.sin(L * D2R);
    cosDec = Math.cos(Math.asin(sinDec));

    //calculate the Sun's local hour angle
    cosH = (Math.cos(zenith * D2R) - (sinDec * Math.sin(latitude * D2R))) / (cosDec * Math.cos(latitude * D2R));
    var H;
    if (sunrise) {
        H = 360 - R2D * Math.acos(cosH)
    } else {
        H = R2D * Math.acos(cosH)
    };
    H = H / 15;

    //calculate local mean time of rising/setting
    T = H + RA - (0.06571 * t) - 6.622;

    //adjust back to UTC
    UT = T - lnHour;
    if (UT > 24) {
        UT = UT - 24;
    } else if (UT < 0) {
        UT = UT + 24;
    }
    // deduce utc offset from output of Date()
    const [, plusMinus, offset] = new Date().toString().match(/GMT(.)?(\d\d\d\d)/);
    const UTC_OFFSET = (plusMinus === '-' ? -1 : 1) * Number(offset) / 100;
    //convert UT value to local time zone of latitude/longitude
    localT = UT + UTC_OFFSET;

    //convert to Milliseconds
    return localT * 3600 * 1000;
}

function dayOfYear() {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start;
  var oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function hourOfDay() {
  var now = new Date();
  var start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // console.log(now, start)
  var diff = now - start;
  var oneHour = 1000 * 60 * 60;
  return diff / oneHour;
}

function getSunRatio() {
  const hour = hourOfDay();
  const sunrise = computeSunrise(dayOfYear(), true)  / 1000 / 3600;
  const sunset = computeSunrise(dayOfYear(), false) / 1000 / 3600;
  
  // return .94; // debugging
  // sun progress during day a on scale [0, 1]
  return (hour - sunrise) / (sunset - sunrise);
}

const sky = (hue) => h('rect', {x: -125, y: -100, height: 300, width: 350, fill: `hsl(${hue}, 35%, ${89 - nightLumOffset()*2}%)`}, []);
const sun = (hue) => {
  const sunRatio = getSunRatio();
  // console.log(sunRatio)
  // sun height, just a simple parabola. no need to flip or anything bc svg coords are backwards anyway
  const sunHeight = 10 + Math.pow((sunRatio - .5) * 100 /*scale to [-100, 100]*/, 2) / 50;
  // console.log(sunHeight);
  return h('circle', {cx: (sunRatio - .5) * 100 + 50, cy: sunHeight, r: 10, fill: `hsl(${hue}, 35%, 97%)`}, [])
};

const view = (state, actions) => {
  return h('div', {id: 'view', oncreate: () => {window.onhashchange = () => {actions.setHueFromHash()};}}, [
    h('input', {
      style: {position: 'fixed', top: '10px', left: '10px'},
      type: 'range',
      min: 0,
      max: 360,
      onchange: actions.setHueFromEvent,
      value: state.hue,
      oncreate: hideElemUnlessMouseMove,
    }),
    h('button', {
      style: {position: 'fixed', bottom: '10px', right: '10px'},
      onclick: ev => {
        const elem = document.body;
        ev.preventDefault();
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
        return false;
      },
      oncreate: hideElemUnlessMouseMove,
    }, ['fullscreen']),
    h('svg', {
      viewBox: '0 0 100 100',
      oncreate: () => setInterval(actions.generatePoints, 10000),
     }, [
      sky(state.hue),
      sun(state.hue),
      ...generateMountainRanges(state.points.map(points => points.visiblePoints), state.hue),
    ]),
  ]);
};

const state = {
  points: new Array(8).fill(0).map(() => new PointGenerator()),
  hue: getSearchParams().get('h') || 206,
};
const actions = {
  generatePoints: n => state => ({
    points: state.points.map(points => points.tick()),
  }),
  setHueFromHash: ev => {
    return {hue: getSearchParams().get('h')};
  },
  setHueFromEvent: ev => {
    window.location.hash = `#h=${ev.target.value}`;
    return {hue: ev.target.value};
  },
};

app(state, actions, view, document.getElementById('app'));

// show element on mouse movement only
const hideElemUnlessMouseMove = el => {
  el.style.opacity = 0;
  el.style.transition = 'opacity .25s ease-in-out';
  let mouseTimeout;
  document.addEventListener('mousemove', () => {
    el.style.opacity = 1;
    mouseTimeout = setTimeout(() => {
      el.style.opacity = 0;
    }, 5000);
  });
};
// show glitch button & slider on mouse movement only
hideElemUnlessMouseMove(document.querySelector('.glitchButton'));