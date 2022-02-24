// import { SVM } from "libsvm-js";

export function range(n) {
  return Array(n)
    .fill()
    .map((_, i) => i);
}

// export function vmin(arr) {
//   return arr.reduce((prev, cur )=> Math.min())
// }

export function sqrdist(p1, p2) {
  let dx = p2[0] - p1[0],
    dy = p2[1] - p1[1];
  return dx * dx + dy * dy;
}

export function getModelShape(theta, xlim, ylim) {
  let x1 = xlim[0];
  let x2 = xlim[1];
  let y1 = (-theta[2] - x1 * theta[0]) / theta[1];
  let y2 = (-theta[2] - x2 * theta[0]) / theta[1];

  let below = [],
    above = [
      [x1, ylim[0]],
      [x1, ylim[1]],
      [x2, ylim[1]],
      [x2, ylim[0]],
      [x1, ylim[0]],
    ];

  if (y1 > ylim[1] && y2 > ylim[1]) [above, below] = [below, above];
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

  return {
    boundary: [
      [x1, y1],
      [x2, y2],
    ],
    below: below,
    above: above,
  };
}

// should move this into json instead of computing
export function attackSuccess(subpopulation, theta) {
  return 0;
}

let rng = {
  state: 1,
  m: 0x80000000,
  a: 1103515245,
  c: 12345,
};
function random() {
  rng.state = (rng.a * rng.state + rng.c) % rng.m;
  return rng.state / (rng.m - 1);
}

function randGauss() {
  let u = 0,
    v = 0;
  while (u === 0) u = random();
  while (v === 0) v = random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function randInt(n) {
  return parseInt(n * random()) % n;
}

export function make_classification(n_samples, flip_y, class_sep, seed) {
  let X = [],
    y = [];

  rng.state = seed;

  let rndCorner = [randInt(2), randInt(2)];
  if (rndCorner == [1, 1]);
  [-1, 1].forEach((label) => {
    let [s1, s2] = [random() + 0.5, random() + 0.5];
    let t = randGauss() / 2;
    let cluster = range(n_samples / 2).map(() => {
      let e = [
        label * class_sep + s1 * randGauss(),
        label * class_sep + s2 * randGauss(),
      ];
      e[1] += t * e[0];
      return e;
    });

    for (let i = 0; i < 2; ++i) {}

    X = X.concat(cluster);

    // y = y.concat(range(n_samples / 2).map(() => label));

    y = y.concat(
      range(n_samples / 2).map(() => (2 * random() < flip_y ? -label : label))
    );
  });

  for (let i = 0; i < 2; ++i) {
    let [xMin, xMax] = [
      Math.min(...X.map((x) => x[i])),
      Math.max(...X.map((x) => x[i])),
    ];
    let p2p = xMax - xMin;
    X = X.map((e) => {
      e[i] = (e[i] - xMin) / p2p;
      return e;
    });
  }

  let dset = X.map((e, i) => {
    return {
      x: e,
      y: y[i],
      subpops: [],
    };
  });

  return dset;
}

// export async function train_svc(X, y) {
//   let svm = new SVM({
//     kernel: SVM.KERNEL_TYPES.LINEAR,
//     type: SVM.SVM_TYPES.ONE_CLASS,
//     cost: 1,
//   });

//   svm.train(X, y);
//   return svm;
// }
