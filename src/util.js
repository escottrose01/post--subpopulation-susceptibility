export function range(n) {
  return Array(n)
    .fill()
    .map((_, i) => i);
}

export function sqrdist(p1, p2) {
  let dx = p2[0] - p1[0],
    dy = p2[1] - p1[1];
  return dx * dx + dy * dy;
}

export function vec2mean(arr) {
  let n = arr.length;
  let x = 0;
  let y = 0;
  for (let i = 0; i < n; ++i) {
    x += arr[i][0];
    y += arr[i][1];
  }
  return [x / n, y / n];
}

export function getModelShape(theta, xlim, ylim) {
  let above, below, boundary;

  if (theta[0] === 0 && theta[1] === 0) {
    above = [
      [0, 0],
      [0, 0],
    ];
    below = [
      [0, 0],
      [0, 0],
    ];
    boundary = [
      [0, 0],
      [0, 0],
    ];
  } else if (theta[1] === 0) {
  } else {
    let x1 = xlim[0];
    let x2 = xlim[1];
    let y1 = (-theta[2] - x1 * theta[0]) / theta[1];
    let y2 = (-theta[2] - x2 * theta[0]) / theta[1];

    below = [];
    above = [
      [x1, ylim[0]],
      [x1, ylim[1]],
      [x2, ylim[1]],
      [x2, ylim[0]],
      [x1, ylim[0]],
    ];

    if (theta[1] === 0 && theta[0] === 0);
    else if (y1 > ylim[1] && y2 > ylim[1]) [above, below] = [below, above];
    else {
      below = [
        [x1, y1],
        [x2, y2],
        [x2, Math.min(y1, ylim[0])],
        [x1, Math.min(y1, ylim[0])],
        [x1, y1],
      ];

      above = [
        [x1, y1],
        [x2, y2],
        [x2, Math.max(y1, ylim[1])],
        [x1, Math.max(y1, ylim[1])],
        [x1, y1],
      ];
    }

    boundary = [
      [x1, y1],
      [x2, y2],
    ];
  }

  return {
    boundary: boundary,
    below: below,
    above: above,
  };
}

export class RNG {
  state = 1;
  #m = 0x80000000;
  #a = 1103515245;
  #c = 12345;

  constructor(seed = 1) {
    this.state = seed;
  }

  random() {
    this.state = (this.#a * this.state + this.#c) % this.#m;
    return this.state / (this.#m - 1);
  }

  randGauss() {
    let u = 0,
      v = 0;
    while (u === 0) u = this.random();
    while (v === 0) v = this.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  randInt(n) {
    return parseInt(n * this.random()) % n;
  }
}

// should move this into json instead of computing
export function attackSuccess(subpopulation, theta) {
  return 0;
}
