function randInt(max) {
  return Math.floor(Math.random() * max);
}

function dot(x, y) {
  return x[0] * y[0] + x[1] * y[1];
}

export async function generateTargetModel(X, y, subpop) {}

export async function labelFlipPoint(X, y, subpop) {
  let choice = randInt(subpop.length);
  return {
    x: X[choice],
    y: -y[choice],
  };
}

export async function onlineAttackPoint(
  X,
  y,
  imModel,
  targetModel,
  xlim,
  ylim
) {
  let theta = [targetModel[0], targetModel[1]];
  let b = targetModel[2];

  let x = [0.5, 0.5];
}
