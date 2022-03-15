import { RNG } from "./util.js";

export class modelTargetedAttack {
  #targetModel;

  constructor(dset, spIndex) {}

  getNextPoint() {
    return [[0, 0], 1];
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

  getNextPoint() {
    let choice = this.#subpop[this.#rng.randInt(this.#subpop.length)];
    return [choice.x, -choice.y];
  }
}

// export async function generateTargetModel(X, y, subpop) {}

// export async function labelFlipPoint(X, y, subpop) {
//   let choice = randInt(subpop.length);
//   return {
//     x: X[choice],
//     y: -y[choice],
//   };
// }

// export async function onlineAttackPoint(
//   X,
//   y,
//   imModel,
//   targetModel,
//   xlim,
//   ylim
// ) {
//   let theta = [targetModel[0], targetModel[1]];
//   let b = targetModel[2];

//   let x = [0.5, 0.5];
// }
