// Hot reloading
// import * as _unused from "raw-loader!./index.ejs";
// TODO: disable before publishing

import Scatterplot from "./diagrams/scatterplot.svelte";

var data1 = require("../static/data/1.00-0.1-5.json");
var data2 = require("../static/data/2.00-1.0-4.json");
var data3 = require("../static/data/0.00-0.0-4.json");
var data4 = require("../static/data/2.00-0.0-4.json");

{
  const figure = document.getElementById("svelte-scatterplot-dfigure-example1");
  let scatterplot;
  figure.addEventListener("ready", () => {
    const target = figure.querySelector("#svelte-scatterplot-target");
    scatterplot = new Scatterplot({
      target: target,
      props: {
        data: data1,
        initSpIndex: 6,
      },
    });
  });
}

{
  const figure = document.getElementById("svelte-scatterplot-dfigure-example2");
  let scatterplot;
  figure.addEventListener("ready", () => {
    const target = figure.querySelector("#svelte-scatterplot-target");
    scatterplot = new Scatterplot({
      target: target,
      props: {
        data: data2,
        initSpIndex: 6,
      },
    });
  });
}

{
  const figure = document.getElementById("svelte-scatterplot-dfigure-example3");
  let scatterplot;
  figure.addEventListener("ready", () => {
    const target = figure.querySelector("#svelte-scatterplot-target");
    scatterplot = new Scatterplot({
      target: target,
      props: {
        data: data3,
        initSpIndex: 6,
      },
    });
  });
}

{
  const figure = document.getElementById("svelte-scatterplot-dfigure-example4");
  let scatterplot;
  figure.addEventListener("ready", () => {
    const target = figure.querySelector("#svelte-scatterplot-target");
    scatterplot = new Scatterplot({
      target: target,
      props: {
        data: data4,
        initSpIndex: 4,
      },
    });
  });
}

{
  const figure = document.getElementById("svelte-scatterplot-dfigure-example5");
  let scatterplot;
  figure.addEventListener("ready", () => {
    const target = figure.querySelector("#svelte-scatterplot-target");
    scatterplot = new Scatterplot({
      target: target,
      props: {
        data: data4,
        initSpIndex: 3,
      },
    });
  });
}
