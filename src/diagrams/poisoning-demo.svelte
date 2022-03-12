<script>
  import { onMount } from "svelte";
  import { getModelShape, sqrdist } from "../util.js";
  import { make_classification } from "../dataset.js";
  import { SVM } from "../svm.js";

  export let fID;
  export let controls;

  let canvas;
  let svg;
  let alphaSlider, betaSlider;
  // let seedSlider;
  let seedButton, seedField;
  let alphaText, betaText, seedText;
  let algoGroup;
  let labelButton, toolButton, resetButton, subpopButton;
  let playButton, stepForwardButton, stepBackButton;

  let flip_y = 0.0;
  let class_sep = 1.0;
  let seed = 1;
  const n_samples = 128;

  let [dset, clusterCenters] = make_classification(
    n_samples,
    flip_y,
    class_sep,
    seed
  );
  let svmClean = new SVM();
  let svm = new SVM();
  let sp_index = 0;
  let hover_index = -1;
  let action = 0;
  let attack_mode = "manual";
  let poisonLabel = 1;

  let poisons = [];
  let previewPoison = [];

  const width = 984;
  const height = 450;

  const eraserPath =
    "M2.343 9.749l-2.222-2.332c-.081-.085-.121-.196-.121-.307 0-.111.041-.223.121-.307l6.178-6.49c.081-.084.187-.127.293-.127.106 0 .212.043.293.127l2.926 3.075c.081.085.121.196.121.308 0 .111-.04.222-.121.307l-4.641 4.877h2.282v.869h-5.108zm1.513-.869-2.27-2.385-.587.615 1.687 1.77h1.171zm2.733-7.643-4.418 4.643 2.341 2.46 4.418-4.644-2.341-2.459z";
  const pencilPath =
    "M1.2145 7.1365-.0113 9.9037 2.7559 8.678l-1.5415-1.5415zM1.5838 6.6299 7.0865 1.1336l1.6781 1.6799L3.2617 8.3098zM9.2027 2.3757l.3494-.3493A1.1871 1.1871 90 107.8736.3477L7.5238.6961z";
  const subpopPath =
    "M3 2A1 1 0 001 2 1 1 0 003 2M7 3A1 1 0 005 3 1 1 0 007 3M2 5A1 1 0 000 5 1 1 0 002 5M9 6A1 1 0 007 6 1 1 0 009 6M5 5A1 1 0 003 5 1 1 0 005 5M5 8A1 1 0 003 8 1 1 0 005 8M9 9A1 1 0 007 9 1 1 0 009 9";

  // const subpopPath =
  //   "M3 2A1 1 0 001 2 1 1 0 003 2M7 3A1 1 0 005 3 1 1 0 007 3M2 5A1 1 0 000 5 1 1 0 002 5M9 6A1 1 0 007 6 1 1 0 009 6M5 5A1 1 0 003 5 1 1 0 005 5M5 8A1 1 0 003 8 1 1 0 005 8M9 9A1 1 0 007 9 1 1 0 009 9M6 9C6 8 9.168 8.217 9.66 6.332 10.109 4.226 8.199 1.78 5.763 1.48 4.489 1.293 3.253 2.923 2.916 3.635 2.26 5.133 1.211 7.044 2.672 9.086 3.777 10.398 6.007 10.398 5.988 9.011";

  const tools = [
    { name: "add", path: pencilPath },
    { name: "erase", path: eraserPath },
    { name: "subpop-select", path: subpopPath },
  ];

  const render = () => {
    const xValue = (p) => p.x[0];
    const yValue = (p) => p.x[1];
    const getClass = (p) => {
      if (p.subpops === undefined)
        return p.y == 1 ? "blue-poison" : "red-poison";
      if (p.subpops.includes(sp_index)) return "target-point";
      else if (p.subpops.includes(hover_index)) return "selected-point";
      else if (p.y == 1) return "blue-point";
      else return "red-point";
    };

    const margin = { top: 5, right: 40, bottom: 150, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    let extentX = [0.0, 1.0];
    let extentXPad = [extentX[0] - 0.1, extentX[1] + 0.1];
    const xScale = d3
      .scaleLinear()
      .domain(extentXPad)
      .range([0, innerWidth])
      .nice();

    let extentY = [-0.0, 1.0];
    let extentYPad = [extentY[0] - 0.1, extentY[1] + 0.1];
    const yScale = d3
      .scaleLinear()
      .domain(extentYPad)
      .range([innerHeight, 0])
      .nice();

    const shadingG = d3
      .select(svg)
      .attr("pointer-events", "none")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const dsetG = d3
      .select(svg)
      .attr("pointer-events", "none")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const poisonG = d3
      .select(svg)
      .attr("pointer-events", "none")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const previewPoisonG = d3
      .select(svg)
      .attr("pointer-events", "none")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const modelG = d3
      .select(svg)
      .attr("pointer-events", "none")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight).tickPadding(15);
    const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(10);

    const yAxisG = dsetG.append("g").call(yAxis);

    const xAxisG = dsetG
      .append("g")
      .call(xAxis)
      .attr("transform", `translate(0,${innerHeight})`);

    let line = d3
      .line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]));

    modelG
      .append("clipPath")
      .attr("id", `rect-clip${fID}`)
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", innerWidth)
      .attr("height", innerHeight);

    const model_c = modelG
      .append("line")
      .style("stroke", "darkgray")
      .style("stroke-width", 5)
      .attr("clip-path", `url(#rect-clip${fID})`);

    const model_t = modelG
      .append("line")
      .style("stroke", "black")
      .style("stroke-width", 5)
      .attr("clip-path", `url(#rect-clip${fID})`);

    const belowArea = shadingG
      .append("path")
      .attr("clip-path", `url(#rect-clip${fID})`);

    const aboveArea = shadingG
      .append("path")
      .attr("clip-path", `url(#rect-clip${fID})`);

    let dsetScatter = dsetG
      .selectAll("circle")
      .data(dset)
      .enter()
      .append("circle")
      .attr("class", getClass)
      .attr("cx", (d) => xScale(xValue(d)))
      .attr("cy", (d) => yScale(yValue(d)));

    let poisonScatter = poisonG.selectAll("path");
    let previewPoisonScatter = previewPoisonG.selectAll("path");

    let delaunay = d3.Delaunay.from(clusterCenters);

    alphaSlider = d3.select(controls).select("#alphaSlider");
    betaSlider = d3.select(controls).select("#betaSlider");
    seedButton = d3.select(controls).select("#seedButton");
    seedField = d3.select(controls).select("#seedField");

    alphaText = d3.select(controls).select("#alphaText");
    betaText = d3.select(controls).select("#betaText");
    seedText = d3.select(controls).select("#seedText");

    labelButton = d3.select(controls).select("#labelButton");
    toolButton = d3.select(controls).select("#toolButton");
    resetButton = d3.select(controls).select("#resetButton");

    //--- figure interaction control ---//
    const updateClasses = () => {
      poisonScatter.attr("class", getClass);
      dsetScatter.attr("class", getClass);
    };

    const resetPoisons = () => {
      poisons = [];
      poisonScatter = poisonG.selectAll("path").data(poisons).exit().remove();
    };

    const updateModels = () => {
      let modelShape;
      let theta_c = svmClean.parameters;
      let theta_t = svm.parameters;

      modelShape = getModelShape(theta_c, extentXPad, extentYPad);
      model_c
        .attr("x1", xScale(modelShape.boundary[0][0]))
        .attr("x2", xScale(modelShape.boundary[1][0]))
        .attr("y1", yScale(modelShape.boundary[0][1]))
        .attr("y2", yScale(modelShape.boundary[1][1]));

      modelShape = getModelShape(theta_t, extentXPad, extentYPad);
      model_t
        .attr("x1", xScale(modelShape.boundary[0][0]))
        .attr("x2", xScale(modelShape.boundary[1][0]))
        .attr("y1", yScale(modelShape.boundary[0][1]))
        .attr("y2", yScale(modelShape.boundary[1][1]));
      belowArea
        .attr("d", line(modelShape.below))
        .attr("class", theta_t[1] < 0 ? "area-blue" : "area-red");
      aboveArea
        .attr("d", line(modelShape.above))
        .attr("class", theta_t[1] < 0 ? "area-red" : "area-blue");
    };

    const retrainModels = (retrainClean) => {
      let data = dset.concat(poisons);
      if (retrainClean) {
        svmClean.fitGD(
          dset.map((d) => d.x),
          dset.map((d) => d.y),
          updateModels
        );
      }
      svm.fitGD(
        data.map((d) => d.x),
        data.map((d) => d.y),
        updateModels
      );
    };

    const mousemoveHandler = (event) => {
      if (attack_mode !== "manual") return;

      let [x, y] = d3.pointer(event);
      (x -= margin.left), (y -= margin.top);
      [x, y] = [xScale.invert(x), yScale.invert(y)];

      switch (tools[action].name) {
        case "add":
          let poison = [x, y];
          previewPoison =
            x >= extentX[0] &&
            x <= extentX[1] &&
            y >= extentY[0] &&
            y <= extentY[1]
              ? [
                  {
                    x: poison,
                    y: poisonLabel,
                  },
                ]
              : [];
          previewPoisonScatter = previewPoisonG
            .selectAll("path")
            .data(previewPoison);

          previewPoisonScatter.exit().remove();

          previewPoisonScatter
            .attr("d", d3.symbol().type(d3.symbolCross).size(200))
            .attr(
              "transform",
              (d) => `translate(${xScale(xValue(d))},${yScale(yValue(d))})`
            )
            .enter()
            .append("path")
            .attr("class", getClass)
            .attr("d", d3.symbol().type(d3.symbolCross).size(200))
            .attr(
              "transform",
              (d) => `translate(${xScale(xValue(d))},${yScale(yValue(d))})`
            );
          break;
        case "subpop-select":
          hover_index = delaunay.find(x, y, sp_index);
          if (sqrdist(clusterCenters[hover_index], [x, y]) > 0.05)
            hover_index = -1;
          updateClasses();
          break;
      }
    };

    const clickHandler = (event) => {
      if (attack_mode !== "manual") return;

      let [x, y] = d3.pointer(event);
      (x -= margin.left), (y -= margin.top);
      [x, y] = [xScale.invert(x), yScale.invert(y)];
      let poison = [x, y];

      switch (tools[action].name) {
        case "add":
          if (
            x >= extentX[0] &&
            x <= extentX[1] &&
            y >= extentY[0] &&
            y <= extentY[1]
          ) {
            poisons.push({
              x: poison,
              y: poisonLabel,
            });
            poisonScatter = poisonG.selectAll("path").data(poisons);
            poisonScatter
              .enter()
              .append("path")
              .attr("class", getClass)
              .attr("d", d3.symbol().type(d3.symbolCross).size(200))
              .attr(
                "transform",
                (d) => `translate(${xScale(xValue(d))},${yScale(yValue(d))})`
              );

            retrainModels(false);
          }
          break;
        case "subpop-select":
          if (hover_index != -1 && hover_index != sp_index) {
            sp_index = hover_index;
            resetPoisons();
          }
          retrainModels(false);
          updateClasses();
          break;
      }
    };

    const mouseoutHandler = (event) => {
      if (attack_mode !== "manual") return;

      hover_index = -1;
      updateClasses();

      previewPoisonScatter.data([]).exit().remove();
    };

    const regenerateDataset = () => {
      [dset, clusterCenters] = make_classification(
        n_samples,
        flip_y,
        class_sep,
        seed
      );
      delaunay = d3.Delaunay.from(clusterCenters);

      dsetScatter = dsetG.selectAll("circle").data(dset);
      dsetScatter
        .attr("class", getClass)
        .transition()
        .duration(250)
        .attr("cx", (d) => xScale(xValue(d)))
        .attr("cy", (d) => yScale(yValue(d)));
      dsetScatter.exit().remove();
    };

    const controlHandler = (control) => {
      switch (control) {
        case "alphaInput":
          class_sep = 0.25 * +alphaSlider.node().value;
          alphaText.text(`Class Separation α = ${class_sep.toFixed(2)}`);
          break;
        case "alphaChange":
          regenerateDataset();
          resetPoisons();
          retrainModels(true);
          break;
        case "betaInput":
          flip_y = 0.1 * +betaSlider.node().value;
          betaText.text(`Random Label Fraction β = ${flip_y.toFixed(2)}`);
          break;
        case "betaChange":
          regenerateDataset();
          resetPoisons();
          retrainModels(true);
          break;
        case "seedButton":
          seed = Math.floor(Math.random() * 100000);
          seedField.node().value = seed;
          regenerateDataset();
          resetPoisons();
          retrainModels(true);
          break;
        case "seedField":
          seed = parseInt(seedField.node().value);
          seed = Math.min(Math.max(seed, 1), 100000000000);
          seedField.node().value = seed;
          regenerateDataset();
          resetPoisons();
          retrainModels(true);
          break;
        case "labelButton":
          poisonLabel = -poisonLabel;
          labelButton
            .select("svg")
            .select("path")
            .attr("fill", poisonLabel === -1 ? "orangered" : "steelblue");
          break;
        case "toolButton":
          action = (action + 1) % tools.length;
          toolButton.select("svg").select("path").attr("d", tools[action].path);
          break;
        case "resetButton":
          resetPoisons();
          retrainModels(false);
          break;
      }
    };

    d3.select(canvas)
      .on("mousemove", mousemoveHandler)
      .on("click", clickHandler)
      .on("mouseout", mouseoutHandler);

    alphaSlider
      .on("input", () => controlHandler("alphaInput"))
      .on("change", () => controlHandler("alphaChange"));
    betaSlider
      .on("input", () => controlHandler("betaInput"))
      .on("change", () => controlHandler("betaChange"));
    seedButton.on("click", () => controlHandler("seedButton"));
    seedField.on("change", () => controlHandler("seedField"));
    labelButton.on("click", () => controlHandler("labelButton"));
    toolButton.on("click", () => controlHandler("toolButton"));
    resetButton.on("click", () => controlHandler("resetButton"));

    retrainModels(true);
  };

  onMount(() => {
    render();
  });
</script>

<svg bind:this={svg} {width} {height} class="overlay" />
<canvas bind:this={canvas} {width} {height} />
