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

export function getModelShape(theta, xlim, ylim) {
  let x1 = xlim[0];
  let x2 = xlim[1];
  let y1 = (-theta[2] - x1 * theta[0]) / theta[1];
  let y2 = (-theta[2] - x2 * theta[0]) / theta[1];

  let below = [
    [x1, y1],
    [x2, y2],
    [x2, Math.min(y1, ylim[0])],
    [x1, Math.min(y1, ylim[0])],
    [x1, y1],
  ];

  let above = [
    [x1, y1],
    [x2, y2],
    [x2, Math.max(y1, ylim[1])],
    [x1, Math.max(y1, ylim[1])],
    [x1, y1],
  ];

  return {
    boundary: [
      [x1, y1],
      [x2, y2],
    ],
    below: below,
    above: above,
  };
}

export function attackSuccess(subpopulation, theta) {}
