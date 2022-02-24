// Hot reloading
// import * as _unused from "raw-loader!./index.ejs";
// TODO: disable before publishing

import AttackAnimation from "./diagrams/attack-animation.svelte";
import PoisonDemo from "./diagrams/poisoning-demo.svelte";

let fID = 0;

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
  const figure = document.getElementById("svelte-scatterplot-dfigure-example1");
  let scatterplot;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/1.00-0.1-5.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-scatterplot-target");
        scatterplot = new AttackAnimation({
          target: target,
          props: {
            data: dataJson,
            initSpIndex: 6,
            fID: fID++,
          },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-scatterplot-dfigure-example2");
  let scatterplot;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/2.00-1.0-4.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-scatterplot-target");
        scatterplot = new AttackAnimation({
          target: target,
          props: {
            data: dataJson,
            initSpIndex: 6,
            fID: fID++,
          },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-scatterplot-dfigure-example3");
  let scatterplot;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/0.00-0.0-4.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-scatterplot-target");
        scatterplot = new AttackAnimation({
          target: target,
          props: {
            data: dataJson,
            initSpIndex: 8,
            fID: fID++,
          },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-scatterplot-dfigure-example4");
  let scatterplot;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/2.00-0.0-4.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-scatterplot-target");
        scatterplot = new AttackAnimation({
          target: target,
          props: {
            data: dataJson,
            initSpIndex: 4,
            fID: fID++,
          },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-scatterplot-dfigure-example5");
  let scatterplot;
  figure.addEventListener("ready", () => {
    fetch("https://escottrose01.github.io/poisoning-data/data/2.00-0.0-4.json")
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-scatterplot-target");
        scatterplot = new AttackAnimation({
          target: target,
          props: {
            data: dataJson,
            initSpIndex: 3,
            fID: fID++,
          },
        });
      });
  });
}
