<script>
  import { onMount } from "svelte";
  import { range } from "../util.js";
  import { ramp } from "../colorbar.js";
  import * as svgPaths from "../svg-paths.js";

  export let scatterData;
  export let key;

  const config = {
    cleanacc: {
      title: "Average Clean Model Accuracy",
      legendTitle: "Accuracy",
      baseUrl: "https://escottrose01.github.io/poisoning-data/clean-models/",
      ext: "png",
    },
    difficulty: {
      title: "Average Attack Difficulty",
      legendTitle: "Difficulty",
      baseUrl: "https://escottrose01.github.io/poisoning-data/attack-webp/",
      ext: "webp",
    },
  }[key];

  let canvas;
  let svg;
  let datasetViewer;

  let alpha = 2.0;
  let beta = 0.1;

  const width = 704;
  const height = 484 + 60;
  const margin = { top: 40, right: 240, bottom: 120, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const render = () => {
    let extentX = [0.0, 3.0]; // class_sep
    let extentXPad = [extentX[0] - 0.1, extentX[1] + 0.1];
    const xScale = d3.scaleLinear().domain(extentXPad).range([0, innerWidth]);

    let extentY = [0.0, 1.0]; // flip_y
    let extentYPad = [extentY[0] - 0.05, extentY[1] + 0.05];
    const yScale = d3.scaleLinear().domain(extentYPad).range([innerHeight, 0]);

    const scatterG = d3
      .select(svg)
      .attr("pointer-events", "none")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const selectableG = d3
      .select(svg)
      .attr("pointer-events", "none")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const scaleG = d3
      .select(svg)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top + innerHeight + 55})`);

    d3.select(svg)
      .append("image")
      .attr("href", `images/${key}-contour.png`)
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("preserveAspectRatio", "none");

    d3.select(svg)
      .append("text")
      .attr("class", "fig-title")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "baseline")
      .attr("x", innerWidth / 2 + margin.left)
      .attr("y", (2 * margin.top) / 3)
      .text(config.title);

    const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight).tickPadding(15);
    xAxis.tickValues(range(7).map((x, i) => i / 2));
    d3.select(svg)
      .append("text")
      .attr("class", "fig-label-text")
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2 + margin.left)
      .attr("y", innerHeight + margin.top + 35)
      .text("Class separation α");

    const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(10);
    yAxis.tickValues(range(6).map((x, i) => i / 5));
    d3.select(svg)
      .append("text")
      .attr("class", "fig-label-text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", 10)
      .attr("x", -margin.top - innerHeight / 2)
      .text("Random Label Fraction β");

    const yAxisG = scatterG.append("g").call(yAxis);
    yAxisG.attr("class", "unselectable");

    const xAxisG = scatterG.append("g").call(xAxis).attr("transform", `translate(0,${innerHeight})`);
    xAxisG.attr("class", "unselectable");

    const scatterPoints = scatterData.reduce(
      (prev, cur, i) =>
        prev.concat(
          cur.map((t, j) => {
            return {
              x: i / 4,
              y: j / 10,
              v: t,
            };
          })
        ),
      []
    );

    const scatterExtent = d3.extent(scatterPoints, (d) => d.v);
    const color = d3.scaleSequential(d3.interpolateViridis).domain(scatterExtent.reverse()).nice();
    const colorScale = d3.scaleLinear().domain(scatterExtent.reverse()).range([0, innerWidth]).nice();

    scaleG
      .append("image")
      .attr("width", innerWidth)
      .attr("height", 20)
      .attr("preserveAspectRatio", "none")
      .attr("style", "outline: 1px solid black;")
      .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(1, 0), 2))).toDataURL());

    scaleG
      .append("g")
      .attr("transform", "translate(0, 20)")
      .attr("class", "colorbar")
      .call(d3.axisBottom(colorScale).tickSize(6).tickPadding(5));

    scaleG.append("text").attr("class", "fig-label-text").attr("y", -5).text(config.legendTitle);

    scatterG
      .selectAll("circle")
      .data(scatterPoints)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", (d) => (d.x === alpha && d.y === beta ? 12 : 6))
      .attr("fill", (d) => color(d.v));

    selectableG
      .selectAll("circle")
      .data(scatterPoints)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.x - 0.125))
      .attr("y", (d) => yScale(d.y + 0.05))
      .attr("width", 33)
      .attr("height", 35)
      .attr("fill", "rgba(0,0,0,0)")
      .attr("style", "pointer-events: visible;")
      .on("mouseover", (d) => {
        let data = d.target.__data__;
        scatterG
          .selectAll("circle")
          .filter((d) => d.x === data.x && d.y === data.y)
          .transition()
          .duration(50)
          .attr("r", 12);
      })
      .on("mouseleave", (d) => {
        let data = d.target.__data__;
        if (data.x === alpha && data.y === beta) return;
        scatterG
          .selectAll("circle")
          .filter((d) => d.x === data.x && d.y === data.y)
          .transition()
          .duration(50)
          .attr("r", 6);
      })
      .on("click", (d) => {
        let data = d.target.__data__;
        alpha = data.x;
        beta = data.y;
        scatterG
          .selectAll("circle")
          .filter((d) => d.x !== alpha || d.y !== beta)
          .transition()
          .duration(50)
          .attr("r", 6);
        reloadDsets(alpha, beta);
      });

    const reloadDsets = async (_alpha, _beta) => {
      d3.select(datasetViewer)
        .selectAll("div")
        .nodes()
        .forEach((d, i) => {
          d3.select(d)
            .select("img")
            .attr("src", config.baseUrl + `${_alpha.toFixed(2)}-${_beta.toFixed(1)}-${i + 1}.${config.ext}`)
            .attr("alt", `${_alpha.toFixed(2)}-${_beta.toFixed(1)}-${i + 1}`);
        });
    };

    reloadDsets(alpha, beta);
  };

  onMount(() => {
    render();
  });
</script>

<svg bind:this={svg} {width} {height} class="overlay">
  <rect
    x={width - margin.right + 20}
    y={margin.top}
    width={margin.right - 40}
    height={innerHeight + 80}
    fill="white"
    stroke="#d3d3d3"
    stroke-width="2"
    rx="5"
  />
  <rect
    x={width - margin.right + 80}
    y={margin.top - 5}
    width={margin.right - 160}
    height={10}
    fill="white"
    stroke-width="0"
    border="none"
  />
</svg>
<div class="overlay" style="left: {margin.left}; top: {margin.top}; width:{innerWidth}px; height:{innerHeight}px;">
  <image src="/images/accuracy-contour.png" />
</div>
<div
  class="overlay"
  style="left: {width - margin.right + 20}px; width:{margin.right - 40}px; top:{-12.5 - 5 + margin.top}px;"
>
  <p class="unselectable" style="font-size: large; margin:0px; line-height:30px">Datasets</p>
</div>
<div
  class="summary-box-container"
  style="left: {width - margin.right + 20}px; top:{margin.top}px; width:{margin.right - 40}px; height:{innerHeight +
    80}px;"
>
  <div bind:this={datasetViewer} class="summary-box-scrollarea">
    <div class="summary-box-entry">
      <img alt="" />
    </div>
    <div class="summary-box-entry">
      <img alt="" />
    </div>
    <div class="summary-box-entry">
      <img alt="" />
    </div>
    <div class="summary-box-entry">
      <img alt="" />
    </div>
    <div class="summary-box-entry">
      <img alt="" />
    </div>
    <div class="summary-box-entry">
      <img alt="" />
    </div>
    <div class="summary-box-entry">
      <img alt="" />
    </div>
    <div class="summary-box-entry">
      <img alt="" />
    </div>
    <div class="summary-box-entry">
      <img alt="" />
    </div>
    <div class="summary-box-entry">
      <img alt="" />
    </div>
  </div>
</div>
<canvas bind:this={canvas} style="pointer-events: none" {width} {height} />
