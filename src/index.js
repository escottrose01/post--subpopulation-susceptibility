// Hot reloading
// import * as _unused from "raw-loader!./index.ejs";
// TODO: disable before publishing

import "regenerator-runtime/runtime";
import "core-js/stable";

import AttackAnimation from "./diagrams/attack-animation.svelte";
import PoisonDemo from "./diagrams/poisoning-demo.svelte";
import ParameterSpaceAcc from "./diagrams/parameter-space-acc.svelte";

let fID = 0;
const figureParams = [
  {
    dset: "1.00-0.1-5",
    subpop: 6,
  },
  {
    dset: "2.00-1.0-4",
    subpop: 6,
  },
  {
    dset: "0.00-0.0-4",
    subpop: 8,
  },
  {
    dset: "2.00-0.0-4",
    subpop: 4,
  },
  {
    dset: "2.00-0.0-4",
    subpop: 0,
  },
];

{
  const figure = document.getElementById("svelte-poison-demo-dfigure");
  let demo;
  figure.addEventListener("ready", () => {
    const target = figure.querySelector("#svelte-demo-target");
    const controls = figure.querySelector("#svelte-demo-controls");
    demo = new PoisonDemo({
      target: target,
      props: {
        fID: fID++,
        controls: controls,
      },
    });
  });
}

{
  const figure = document.getElementById("svelte-param-space-acc-dfigure");
  let scatterplot;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/avg-stats.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-param-space-acc-target");
        scatterplot = new ParameterSpaceAcc({
          target: target,
          props: {
            cleanAccuracies: dataJson.clean_acc,
          },
        });
      });
  });
}

for (let fig = 1; fig <= figureParams.length; ++fig) {
  const figure = document.getElementById(`svelte-scatterplot-dfigure-example${fig}`);
  let scatterplot;
  figure.addEventListener("ready", () => {
    fetch(`https://escottrose01.github.io/poisoning-data/attacks/${figureParams[fig - 1].dset}.json`)
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-scatterplot-target");
        scatterplot = new AttackAnimation({
          target: target,
          props: {
            data: dataJson,
            initSpIndex: figureParams[fig - 1].subpop,
            fID: fID++,
          },
        });
      });
  });
}
