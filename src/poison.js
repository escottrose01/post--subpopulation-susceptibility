import { RNG, accuracy, loss, attackSuccess } from "./util.js";
import { SVM } from "./svm.js";

export class modelTargetedAttack {
  #targetModel;
  #imModel;
  #subpop;
  #destroying;

  constructor(dset, spIndex) {
    this.#subpop = dset.filter((d) => d.subpops.includes(spIndex));
    this.#generateTargetModel(dset);
  }

  destroy() {
    this.#destroying = true;
  }

  async #generateTargetModel(dset) {
    let svm = new SVM();
    let bestTarget;
    let minLoss = Infinity;
    let n = this.#subpop.length;
    let m = 20;
    let repeats = Math.ceil(m / n);
    let poisons = [];
    for (let i = 0; i < 4; ++i) {
      for (let rep = 0; rep < repeats; ++rep) {
        for (let j = 0; j < n; ++j) poisons.push({ x: this.#subpop[j].x, y: -this.#subpop[j].y });
      }
      let data = dset.concat(poisons);

      if (this.#destroying) break;

      await svm.fitGD(
        data.map((d) => d.x),
        data.map((d) => d.y)
      );

      let l = loss(dset, svm.parameters);
      let success = attackSuccess(
        this.#subpop.map((d) => d.x),
        svm.parameters
      );

      if (success > 0.999 && l < minLoss) {
        bestTarget = svm.parameters;
        minLoss = l;
        break;
      }
    }

    this.#targetModel = bestTarget;
  }

  async getNextPoint() {
    if (this.#imModel === undefined || this.#targetModel === undefined) return [undefined, undefined];

    let poison = [[0, 0], 1];
    let maxLossDiff = 0;
    for (let x = 0; x <= 1; x += 0.01) {
      for (let y = 0; y <= 1; y += 0.01) {
        for (let label = -1; label <= 1; label += 2) {
          let l = 0;
          let t = 1 - label * (x * this.#targetModel[0] + y * this.#targetModel[1] + this.#targetModel[2]);
          if (t > 0) l -= t;
          t = 1 - label * (x * this.#imModel[0] + y * this.#imModel[1] + this.#imModel[2]);
          if (t > 0) l += t;

          if (l > maxLossDiff) {
            poison = [[x, y], label];
            maxLossDiff = l;
          }
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1));
    }

    return poison;
  }

  updateIntermediateModel(model) {
    this.#imModel = model;
  }

  get targetModel() {
    return this.#targetModel;
  }
}

export class labelFlipAttack {
  #subpop;
  #rng;

  constructor(dset, spIndex) {
    this.#subpop = dset.filter((d) => d.subpops.includes(spIndex));
    this.#rng = new RNG(1);
  }

  destroy() {}

  async getNextPoint() {
    let choice = this.#subpop[this.#rng.randInt(this.#subpop.length)];
    return [choice.x, -choice.y];
  }
}
