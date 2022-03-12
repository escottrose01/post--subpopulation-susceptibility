import { RNG, vec2mean } from "./util.js";

export class KMeans {
  #clusterCenters = [];
  #clusters = [];
  #delaunay = undefined;
  #k = 2;
  #iters = 5;
  #X = [];

  constructor(k) {
    this.#k = k;
  }

  fit(X, seed = 1) {
    let rng = new RNG(seed);

    this.#X = [...X];
    this.#clusterCenters = new Array(this.#k)
      .fill(0)
      .map(() => [...X[rng.randInt(this.#X.length)]]);
    this.#delaunay = d3.Delaunay.from(this.#clusterCenters);

    for (let iter = 0; iter < this.#iters; ++iter) {
      this.#clusters = new Array(this.#k).fill(0).map(() => new Array(0));
      for (let i = 0; i < this.#X.length; ++i) {
        this.#clusters[this.#delaunay.find(...this.#X[i])].push([
          ...this.#X[i],
        ]);
      }

      for (let i = 0; i < this.#k; ++i) {
        if (this.#clusters[i].length === 0) continue;
        else this.#clusterCenters[i] = vec2mean(this.#clusters[i]);
      }

      this.#delaunay = d3.Delaunay.from(this.#clusterCenters);
    }
  }

  predict(x) {
    if (this.#delaunay === undefined) return -1;
    return this.#delaunay.find(...x);
  }

  get clusterCenters() {
    return this.#clusterCenters;
  }
}
