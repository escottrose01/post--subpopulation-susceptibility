import { RNG, range } from "./util.js";
import { KMeans } from "./kmeans.js";

export function make_classification(nSamples, flipY, classSep, seed) {
  let X = [],
    y = [];

  let rng = new RNG(seed);
  let m = nSamples / 2;

  [-1, 1].forEach((label) => {
    let [s1, s2] = [rng.random() + 0.1, rng.random() + 0.1];
    let t = 2 * rng.random() - 1;
    let flip = rng.random() > 0.5;
    let cluster = range(m).map(() => {
      let e = [
        label * classSep + s1 * rng.randGauss(),
        label * classSep + s2 * rng.randGauss(),
      ];
      e[1] += t * e[0];
      if (flip) e = [e[1], e[0]];
      return e;
    });

    X = X.concat(cluster);

    y = y.concat(
      range(m).map(() => (2 * rng.random() < flipY ? -label : label))
    );
  });

  if (rng.random() > 0.5) {
    for (let i = 0; i < m; ++i) {
      [X[i], X[i + m]] = [X[i + m], X[i]];
    }
  }

  if (rng.random() > 0.5) {
    for (let i = 0; i < X.length; ++i) {
      X[i][1] = -X[i][1];
    }
  }

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

  let clusters = new KMeans(flipY > 0 ? 6 : 3);
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
