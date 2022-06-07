// Hot reloading
// import * as _unused from "raw-loader!./index.ejs";
// TODO: disable before publishing

import "regenerator-runtime/runtime";
import "core-js/stable";

import AttackAnimation from "./diagrams/attack-animation.svelte";
import PoisonDemo from "./diagrams/poisoning-demo.svelte";
import ParameterSpace from "./diagrams/parameter-space.svelte";
import ParameterSpaceAttack from "./diagrams/parameter-space-attacks.svelte";
import DifficultyHistogram from "./diagrams/accuracy-difficulty-histogram.svelte";
import DifficultyScatterplot from "./diagrams/difficulty-scatterplot.svelte";
import AdultHistogram from "./diagrams/adult-histogram.svelte";
import AdultComparison from "./diagrams/adult-comparison.svelte";
import AdultPositivity from "./diagrams/adult-positivity.svelte";

let fID = 0;
const figureParams = [
  {
    dset: "1.00-0.1-5",
    subpop: 10,
  },
  {
    dset: "2.00-1.0-4",
    subpop: 6,
  },
  {
    dset: "0.00-0.0-7",
    subpop: 1,
  },
  {
    dset: "2.00-0.0-4",
    subpop: 4,
  },
  {
    dset: "2.00-0.0-4",
    subpop: 3,
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
        scatterplot = new ParameterSpace({
          target: target,
          props: {
            scatterData: dataJson.clean_acc,
            key: "cleanacc",
          },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-param-space-dif-dfigure");
  let scatterplot;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/avg-stats.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-param-space-dif-target");
        scatterplot = new ParameterSpaceAttack({
          target: target,
          props: {
            scatterData: dataJson.difficulty,
            key: "difficulty",
          },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-cleanacc-dif-hist-dfigure");
  let histogram;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/cleanacc-difficulty.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-cleanacc-dif-hist-target");
        histogram = new DifficultyHistogram({
          target: target,
          props: { data: JSON.parse(dataJson) },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-synth-scatter-dfigure");
  let histogram;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/synth-scatter-stats.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-synth-scatter-target");
        histogram = new DifficultyScatterplot({
          target: target,
          props: { data: JSON.parse(dataJson), fID: fID++ },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-adult-dif-hist-dfigure");
  let histogram;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/adult-difficulty.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-adult-dif-hist-target");
        histogram = new AdultHistogram({
          target: target,
          props: { data: dataJson },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-adult-scatter-dfigure");
  let histogram;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/adult-scatter-stats.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-adult-scatter-target");
        histogram = new DifficultyScatterplot({
          target: target,
          props: { data: JSON.parse(dataJson), fID: fID++ },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-adult-comparison1A-dfigure");
  let chart;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/adult-comparison1.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-adult-comparison1A-target");
        chart = new AdultComparison({
          target: target,
          props: { data: dataJson },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-adult-comparison1B-dfigure");
  let chart;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/adult-comparison1.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-adult-comparison1B-target");
        chart = new AdultPositivity({
          target: target,
          props: { data: dataJson },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-adult-comparison2-dfigure");
  let chart;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/adult-comparison2.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-adult-comparison2-target");
        chart = new AdultComparison({
          target: target,
          props: { data: dataJson, title: "Adult Dataset Attack Difficulty, Similar Ambient Positivity" },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-adult-comparison3-dfigure");
  let chart;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/adult-comparison3.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-adult-comparison3-target");
        chart = new AdultComparison({
          target: target,
          props: { data: dataJson },
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
