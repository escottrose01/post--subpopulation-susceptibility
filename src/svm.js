function randInt(max) {
  return Math.floor(Math.random() * max);
}

function dot(x, y) {
  return x[0] * y[0] + x[1] * y[1];
}

export class SVM {
  #alpha = [];
  #kernel = dot;
  #maxIters = 200;
  #tol = 0.0001;
  #C = 100;
  #theta = new Array(2).fill(0);
  #b = 0;
  #nCalls = 0;

  constructor(C, maxIters, tol) {
    if (C !== undefined) this.#C = C;
    if (maxIters !== undefined) this.#maxIters = maxIters;
    if (tol !== undefined) this.#tol = tol;
  }

  /**
   * Train SVM using SMO
   * @param {*} X data points
   * @param {*} y data labels
   * @param {*} onUpdate called when model weights are updated
   * @param {*} reset whether this call is an update step or training from scratch
   */
  async fitSMO(X, y, onUpdate, reset = true) {
    let id = ++this.#nCalls;
    if (reset) {
      this.#alpha = Array(N).fill(0);
      this.#theta = Array(2).fill(0);
      this.#b = 0;
    }

    let N = X.length;
    while (this.#alpha.length < N) this.#alpha.push(0);

    let iter = 0;
    while (iter < this.#maxIters && id === this.#nCalls) {
      let nChangedAlphas = 0;
      for (let i = 0; i < N; ++i) {
        let E_i = this.#b - y[i];
        for (let j = 0; j < N; ++j) {
          E_i += this.#alpha[j] * y[j] * this.#kernel(X[i], X[j]);
        }

        if (!(y[i] * E_i < -this.#tol && this.#alpha[i] < this.#C) && !(y[i] * E_i > this.#tol && this.#alpha[i] > 0))
          continue;

        let j = i;
        while (j === i) j = randInt(N);

        let E_j = this.#b - y[j];
        for (let k = 0; k < N; ++k) {
          E_j += this.#alpha[k] * y[k] * this.#kernel(X[j], X[k]);
        }

        let alpha_i = this.#alpha[i];
        let alpha_j = this.#alpha[j];

        let L, H;
        if (y[i] === y[j]) {
          L = Math.max(0, alpha_i + alpha_j - this.#C);
          H = Math.min(this.#C, alpha_i + alpha_j);
        } else {
          L = Math.max(0, alpha_j - alpha_i);
          H = Math.min(this.#C, this.#C + alpha_j - alpha_i);
        }

        if (Math.abs(L - H) < 1e-5) continue;

        let eta = 2 * this.#kernel(X[i], X[j]) - this.#kernel(X[i], X[i]) - this.#kernel(X[j], X[j]);

        if (eta >= 0) continue;

        this.#alpha[j] = alpha_j - (y[j] * (E_i - E_j)) / eta;
        this.#alpha[j] = Math.min(Math.max(this.#alpha[j], L), H);
        this.#alpha[i] = alpha_i + y[i] * y[j] * (alpha_j - this.#alpha[j]);

        if (Math.abs(this.#alpha[j] - alpha_j) < 1e-5) continue;

        let b_1 =
          this.#b -
          E_i -
          y[i] * (this.#alpha[i] - alpha_i) * this.#kernel(X[i], X[i]) -
          y[j] * (this.#alpha[j] - alpha_j) * this.#kernel(X[i], X[j]);
        let b_2 =
          this.#b -
          E_j -
          y[i] * (this.#alpha[i] - alpha_i) * this.#kernel(X[i], X[j]) -
          y[j] * (this.#alpha[j] - alpha_j) * this.#kernel(X[j], X[j]);

        if (0 < this.#alpha[i] && this.#alpha[i] < this.#C) this.#b = b_1;
        else if (0 < this.#alpha[j] && this.#alpha[j] < this.#C) this.#b = b_2;
        else this.#b = 0.5 * (b_1 + b_2);

        nChangedAlphas += 1;
      }

      if (nChangedAlphas === 0) iter += 1;
      else {
        iter = 0;
        this.#theta = new Array(2).fill(0);
        for (let i = 0; i < N; ++i) {
          this.#theta[0] += this.#alpha[i] * y[i] * X[i][0];
          this.#theta[1] += this.#alpha[i] * y[i] * X[i][1];
        }
        onUpdate();
      }
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }

  /**
   * Train SVM using gradient descent
   * @param {*} X data points
   * @param {*} y data labels
   * @param {*} onUpdate called when model weights are updated
   */
  async fitGD(X, y) {
    let id = ++this.#nCalls;
    let N = X.length;
    let eta = 0.5;
    let grad = new Array(3).fill(0);
    let loss = Infinity;
    let oldLoss = Infinity;
    let loopCondition = true;

    let iter = 0;
    let decay = 0;
    do {
      grad.fill(0);
      for (let i = 0; i < N; ++i) {
        if (y[i] * (dot(this.#theta, X[i]) + this.#b) < 1) {
          grad[0] -= y[i] * X[i][0];
          grad[1] -= y[i] * X[i][1];
          grad[2] -= y[i];
        }
      }

      grad[0] /= N;
      grad[1] /= N;
      grad[2] /= N;

      grad[0] += this.#theta[0] / this.#C;
      grad[1] += this.#theta[1] / this.#C;

      this.#theta[0] -= eta * grad[0];
      this.#theta[1] -= eta * grad[1];
      this.#b -= eta * grad[2];

      if (iter % 64 === 0) {
        loss = (0.5 * dot(this.#theta, this.#theta)) / this.#C;
        for (let i = 0; i < N; ++i) {
          let l = 1 - y[i] * (dot(this.#theta, X[i]) + this.#b);
          if (l > 0) loss += l;
        }
        if (loss >= oldLoss) {
          eta = 2 / (decay + 4);
          ++decay;
        }
        oldLoss = loss;
      }

      if (iter % 512 === 0) await new Promise((resolve) => setTimeout(resolve, 1));

      loopCondition = (eta > 5e-2 || iter < 1000) && iter < 50000 && id == this.#nCalls;
      ++iter;
    } while (loopCondition);

    return id == this.#nCalls;
  }

  get parameters() {
    return [...this.#theta, this.#b];
  }

  set parameters(params) {
    this.#theta = [params[0], params[1]];
    this.#b = params[2];
  }
}
