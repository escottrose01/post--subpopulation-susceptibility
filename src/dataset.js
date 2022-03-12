import { RNG, range } from "./util.js";
import { KMeans } from "./kmeans.js";

export function make_classification(n_samples, flip_y, class_sep, seed) {
  let X = [],
    y = [];

  let rng = new RNG(seed);

  // let rndCorner = [randInt(2), randInt(2)];
  // if (rndCorner == [1, 1]);
  [-1, 1].forEach((label) => {
    let [s1, s2] = [rng.random() + 0.5, rng.random() + 0.5];
    let t = rng.randGauss() / 2;
    let cluster = range(n_samples / 2).map(() => {
      let e = [
        label * class_sep + s1 * rng.randGauss(),
        label * class_sep + s2 * rng.randGauss(),
      ];
      e[1] += t * e[0];
      return e;
    });

    // for (let i = 0; i < 2; ++i) {}

    X = X.concat(cluster);

    y = y.concat(
      range(n_samples / 2).map(() =>
        2 * rng.random() < flip_y ? -label : label
      )
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

  let clusters = new KMeans(flip_y > 0 ? 6 : 3);
  clusters.fit(
    X.filter((e, i) => y[i] === -1),
    (seed = 1)
  );

  let dset = X.map((e, i) => {
    return {
      x: e,
      y: y[i],
      subpops: y[i] === -1 ? [clusters.predict(e)] : [],
    };
  });

  return [dset, clusters.clusterCenters];
}
