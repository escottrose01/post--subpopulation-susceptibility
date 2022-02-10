// Hot reloading
// import * as _unused from "raw-loader!./index.ejs";
// TODO: disable before publishing

import Scatterplot from "./diagrams/scatterplot.svelte";

{
  const figure = document.getElementById("svelte-scatterplot-dfigure-example1");
  let scatterplot;
  figure.addEventListener("ready", () => {
    const data1 = fetch(
      "https://escottrose01.github.io/poisoning-data/1.00-0.1-5.json"
    )
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-scatterplot-target");
        scatterplot = new Scatterplot({
          target: target,
          props: {
            data: dataJson,
            initSpIndex: 6,
          },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-scatterplot-dfigure-example2");
  let scatterplot;
  figure.addEventListener("ready", () => {
    const data1 = fetch(
      "https://escottrose01.github.io/poisoning-data/2.00-1.0-4.json"
    )
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-scatterplot-target");
        scatterplot = new Scatterplot({
          target: target,
          props: {
            data: dataJson,
            initSpIndex: 6,
          },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-scatterplot-dfigure-example3");
  let scatterplot;
  figure.addEventListener("ready", () => {
    const data1 = fetch(
      "https://escottrose01.github.io/poisoning-data/0.00-0.0-4.json"
    )
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-scatterplot-target");
        scatterplot = new Scatterplot({
          target: target,
          props: {
            data: dataJson,
            initSpIndex: 8,
          },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-scatterplot-dfigure-example4");
  let scatterplot;
  figure.addEventListener("ready", () => {
    const data1 = fetch(
      "https://escottrose01.github.io/poisoning-data/2.00-0.0-4.json"
    )
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-scatterplot-target");
        scatterplot = new Scatterplot({
          target: target,
          props: {
            data: dataJson,
            initSpIndex: 4,
          },
        });
      });
  });
}

{
  const figure = document.getElementById("svelte-scatterplot-dfigure-example5");
  let scatterplot;
  figure.addEventListener("ready", () => {
    const data1 = fetch(
      "https://escottrose01.github.io/poisoning-data/2.00-0.0-4.json"
    )
      .then((resp) => resp.json())
      .then((dataJson) => {
        const target = figure.querySelector("#svelte-scatterplot-target");
        scatterplot = new Scatterplot({
          target: target,
          props: {
            data: dataJson,
            initSpIndex: 3,
          },
        });
      });
  });
}

// {
//   const figure = document.getElementById("svelte-scatterplot-dfigure-example2");
//   let scatterplot;
//   figure.addEventListener("ready", () => {
//     const target = figure.querySelector("#svelte-scatterplot-target");
//     scatterplot = new Scatterplot({
//       target: target,
//       props: {
//         data: data2,
//         initSpIndex: 6,
//       },
//     });
//   });
// }

// {
//   const figure = document.getElementById("svelte-scatterplot-dfigure-example3");
//   let scatterplot;
//   figure.addEventListener("ready", () => {
//     const target = figure.querySelector("#svelte-scatterplot-target");
//     scatterplot = new Scatterplot({
//       target: target,
//       props: {
//         data: data3,
//         initSpIndex: 6,
//       },
//     });
//   });
// }

// {
//   const figure = document.getElementById("svelte-scatterplot-dfigure-example4");
//   let scatterplot;
//   figure.addEventListener("ready", () => {
//     const target = figure.querySelector("#svelte-scatterplot-target");
//     scatterplot = new Scatterplot({
//       target: target,
//       props: {
//         data: data4,
//         initSpIndex: 4,
//       },
//     });
//   });
// }

// {
//   const figure = document.getElementById("svelte-scatterplot-dfigure-example5");
//   let scatterplot;
//   figure.addEventListener("ready", () => {
//     const target = figure.querySelector("#svelte-scatterplot-target");
//     scatterplot = new Scatterplot({
//       target: target,
//       props: {
//         data: data4,
//         initSpIndex: 3,
//       },
//     });
//   });
// }
