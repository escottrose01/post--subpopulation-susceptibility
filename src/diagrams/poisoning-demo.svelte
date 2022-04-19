<script>
  import { onMount } from "svelte";
  import { range, attackSuccess, accuracy, getModelShape, sqrdist } from "../util.js";
  import { make_classification } from "../dataset.js";
  import { SVM } from "../svm.js";
  import { labelFlipAttack, modelTargetedAttack } from "../poison.js";
  import * as svgPaths from "../svg-paths.js";

  export let fID;
  export let controls;

  let canvas;
  let svg;
  let alphaSlider, betaSlider;
  let seedButton, seedField;
  let alphaText, betaText, seedText;
  let algoSelector;
  let manualButtons, labelButton, toolButton, resetButton;
  let algorithmButtons, playButton, algorithmResetButton;
  let cOverallAccuracyText, cSubpopAccuracyText;
  let nPoisonsText, pOverallAccuracyTect, pSubpopAccuracyText;
  let tOverallAccuracyText, tSubpopAccuracyText, lossDifferenceText;
  let targetModelStats;

  let flip_y = 0.0;
  let class_sep = 1.0;
  let seed = 1;
  const nSamples = 128;

  let svmClean = new SVM(64);
  let svm = new SVM(64);
  let spIndex = 0;
  let hoverIndex = -1;
  let deleteIndex = -1;
  let action = 0;
  let attackAlgo = "manual";
  let poisonLabel = 1;
  let attackInstance;
  let attackPaused = false;
  let fitting = false;
  let successScore = 0.0;

  let [dset, clusterCenters] = make_classification(nSamples, flip_y, class_sep, seed);
  let poisons = [];
  let previewPoison = [];
  let subpop = dset.filter((d) => d.subpops.includes(spIndex)).map((d) => d.x);

  // const width = 864;
  const width = 984;
  const height = 600;
  // const height = 550;
  const margin = { top: 5, right: 20 + 220, bottom: 155, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const tools = [
    { name: "add", path: svgPaths.pencilPath },
    // { name: "erase", path: eraserPath },
    { name: "subpop-select", path: svgPaths.subpopPath },
  ];

  const render = () => {
    const xValue = (p) => p.x[0];
    const yValue = (p) => p.x[1];
    const getClass = (p) => {
      if (p.id !== undefined && deleteIndex === p.id) return p.y === 1 ? "blue-delete" : "red-delete";
      if (p.subpops === undefined) return p.y === 1 ? "blue-poison" : "red-poison";
      if (p.subpops.includes(spIndex)) return "target-point";
      else if (p.subpops.includes(hoverIndex)) return "selected-point";
      else if (p.y === 1) return "blue-point";
      else return "red-point";
    };
    const getRadius = (p) => {
      if (p.subpops === undefined) return 4;
      else if (p.subpops.includes(hoverIndex) || p.subpops.includes(spIndex)) return 5;
      else return 4;
    };

    let extentX = [0.0, 1.0];
    let extentXPad = [extentX[0] - 0.025, extentX[1] + 0.025];
    const xScale = d3.scaleLinear().domain(extentXPad).range([0, innerWidth]);

    let extentY = [-0.0, 1.0];
    let extentYPad = [extentY[0] - 0.05, extentY[1] + 0.05];
    const yScale = d3.scaleLinear().domain(extentYPad).range([innerHeight, 0]);

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
    xAxis.tickValues(range(11).map((x, i) => i / 10));
    const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(10);
    yAxis.tickValues(range(11).map((x, i) => i / 10));

    const yAxisG = dsetG.append("g").call(yAxis);
    yAxisG.attr("class", "unselectable");

    const xAxisG = dsetG.append("g").call(xAxis).attr("transform", `translate(0,${innerHeight})`);
    xAxisG.attr("class", "unselectable");

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

    const modelC = modelG
      .append("line")
      .style("stroke", "darkgray")
      .style("stroke-width", 5)
      .attr("clip-path", `url(#rect-clip${fID})`);

    const modelP = modelG
      .append("line")
      .style("stroke", "black")
      .style("stroke-width", 5)
      .attr("clip-path", `url(#rect-clip${fID})`);

    const modelT = modelG
      .append("line")
      .style("stroke", "rgba(0, 0, 0, 0.5)")
      .style("stroke-width", 5)
      .style("stroke-dasharray", "4 4")
      .attr("clip-path", `url(#rect-clip${fID})`);

    const belowArea = shadingG.append("path").attr("clip-path", `url(#rect-clip${fID})`);

    const aboveArea = shadingG.append("path").attr("clip-path", `url(#rect-clip${fID})`);

    let dsetScatter = dsetG
      .selectAll("circle")
      .data(dset)
      .enter()
      .append("circle")
      .attr("class", getClass)
      .attr("cx", (d) => xScale(xValue(d)))
      .attr("cy", (d) => yScale(yValue(d)))
      .attr("r", (d) => getRadius(d));

    let poisonScatter = poisonG.selectAll("path");
    let previewPoisonScatter = previewPoisonG.selectAll("path");

    let delaunay = d3.Delaunay.from(clusterCenters);
    let poisonDelaunay = undefined;

    alphaSlider = d3.select(controls).select("#alphaSlider");
    betaSlider = d3.select(controls).select("#betaSlider");
    seedButton = d3.select(controls).select("#seedButton");
    seedField = d3.select(controls).select("#seedField");

    alphaText = d3.select(controls).select("#alphaText");
    betaText = d3.select(controls).select("#betaText");
    seedText = d3.select(controls).select("#seedText");

    algoSelector = d3.select(controls).select("#attackAlgo");

    manualButtons = d3.select(controls).select("#manual-buttons");
    labelButton = d3.select(controls).select("#labelButton");
    toolButton = d3.select(controls).select("#toolButton");
    resetButton = d3.select(controls).select("#resetButton");

    algorithmButtons = d3.select(controls).select("#algorithm-buttons");
    playButton = d3.select(controls).select("#algorithmPlayButton");
    algorithmResetButton = d3.select(controls).select("#algorithmResetButton");

    targetModelStats = d3.select("#targetModelStats");

    //--- figure interaction control ---//
    const updateClasses = () => {
      poisonScatter.attr("class", getClass);
      dsetScatter.attr("class", getClass);
    };

    const resetPoisons = () => {
      poisons = [];
      poisonDelaunay = undefined;
      nPoisonsText.innerHTML = "0";
      poisonScatter = poisonG.selectAll("path").data(poisons).exit().remove();
    };

    const updateModels = () => {
      let modelShape;
      let thetaC = svmClean.parameters;
      let thetaP = svm.parameters;
      let thetaT = attackInstance ? attackInstance.targetModel : undefined;

      modelShape = getModelShape(thetaC, extentXPad, extentYPad);
      modelC
        .attr("x1", xScale(modelShape.boundary[0][0]))
        .attr("x2", xScale(modelShape.boundary[1][0]))
        .attr("y1", yScale(modelShape.boundary[0][1]))
        .attr("y2", yScale(modelShape.boundary[1][1]));

      modelShape = getModelShape(thetaP, extentXPad, extentYPad);
      modelP
        .attr("x1", xScale(modelShape.boundary[0][0]))
        .attr("x2", xScale(modelShape.boundary[1][0]))
        .attr("y1", yScale(modelShape.boundary[0][1]))
        .attr("y2", yScale(modelShape.boundary[1][1]));
      belowArea.attr("d", line(modelShape.below)).attr("class", thetaP[1] < 0 ? "area-blue" : "area-red");
      aboveArea.attr("d", line(modelShape.above)).attr("class", thetaP[1] < 0 ? "area-red" : "area-blue");

      successScore = attackSuccess(subpop, thetaP);
      pSubpopAccuracyText.innerHTML = `${(100 * (1 - successScore)).toFixed(1)}%`;
      pOverallAccuracyTect.innerHTML = `${(100 * (1 - accuracy(dset, thetaP))).toFixed(1)}%`;

      cSubpopAccuracyText.innerHTML = `${(100 * (1 - attackSuccess(subpop, thetaC))).toFixed(1)}%`;
      cOverallAccuracyText.innerHTML = `${(100 * (1 - accuracy(dset, thetaC))).toFixed(1)}%`;

      if (thetaT !== undefined) {
        tSubpopAccuracyText.innerHTML = `${(100 * (1 - attackSuccess(subpop, thetaT))).toFixed(1)}%`;
        tOverallAccuracyText.innerHTML = `${(100 * (1 - accuracy(dset, thetaT))).toFixed(1)}%`;

        modelShape = getModelShape(thetaT, extentXPad, extentYPad);
        modelT
          .attr("x1", xScale(modelShape.boundary[0][0]))
          .attr("x2", xScale(modelShape.boundary[1][0]))
          .attr("y1", yScale(modelShape.boundary[0][1]))
          .attr("y2", yScale(modelShape.boundary[1][1]));
      }

      fitting = false;
    };

    const retrainModels = async (retrainClean) => {
      fitting = true;
      let data = dset.concat(poisons);
      let update;

      if (retrainClean) {
        update = await svmClean.fitGD(
          dset.map((d) => d.x),
          dset.map((d) => d.y)
        );
        if (update) {
          svm.parameters = svmClean.parameters;
          updateModels();
        }
      } else {
        update = await svm.fitGD(
          data.map((d) => d.x),
          data.map((d) => d.y)
        );
        if (update) updateModels();
      }
    };

    const insertPoison = async (poison, label) => {
      poisons.push({
        x: poison,
        y: label,
      });
      nPoisonsText.innerHTML = `${poisons.length}`;

      poisonDelaunay = undefined;

      poisonG
        .selectAll("path")
        .data(poisons)
        .enter()
        .append("path")
        .attr("class", getClass)
        .attr("d", d3.symbol().type(d3.symbolCross).size(600))
        .attr("transform", (d) => `translate(${xScale(xValue(d))},${yScale(yValue(d))})`)
        .transition()
        .duration(200)
        .attr("d", d3.symbol().type(d3.symbolCross).size(200));
      poisonScatter = poisonG.selectAll("path");

      retrainModels(false);
    };

    const configureAttackAlgorithm = () => {
      switch (attackAlgo) {
        case "manual":
          attackInstance = undefined;
          break;
        case "label flip":
          attackLoop(new labelFlipAttack(dset, spIndex));
          break;
        case "model-targeted":
          modelT.attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", 0);
          attackLoop(new modelTargetedAttack(dset, spIndex, updateModels));
          break;
      }
    };

    const attackLoop = async (instance) => {
      attackInstance = instance;
      lossDifferenceText.innerHTML = "???";
      let [poison, label] = [undefined, undefined];
      while (instance === attackInstance) {
        if (successScore < 1 && !attackPaused && poisons.length < nSamples && !fitting) {
          if (attackInstance.updateIntermediateModel !== undefined)
            attackInstance.updateIntermediateModel(svm.parameters);

          if (poison !== undefined) await insertPoison(poison, label);
          [poison, label] = await attackInstance.getNextPoint();

          let thetaT = attackInstance.targetModel;
          if (thetaT !== undefined) {
            let thetaP = svm.parameters;
            let l = 0;
            let t = 1 - label * (poison[0] * thetaT[0] + poison[1] * thetaT[1] + thetaT[2]);
            if (t > 0) l -= t;
            t = 1 - label * (poison[0] * thetaP[0] + poison[1] * thetaP[1] + thetaP[2]);
            if (t > 0) l += t;
            lossDifferenceText.innerHTML = l.toFixed(2);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      instance.destroy();
    };

    const mousemoveHandler = (event) => {
      let [x, y] = d3.pointer(event);
      (x -= margin.left), (y -= margin.top);
      [x, y] = [xScale.invert(x), yScale.invert(y)];

      switch (tools[action].name) {
        case "add":
          let poisonClip = [
            Math.min(Math.max(x, extentX[0]), extentX[1]),
            Math.min(Math.max(y, extentY[0]), extentY[1]),
          ];
          previewPoison =
            x >= extentXPad[0] && x <= extentXPad[1] && y >= extentYPad[0] && y <= extentYPad[1]
              ? [
                  {
                    x: poisonClip,
                    y: poisonLabel,
                  },
                ]
              : [];
          previewPoisonScatter = previewPoisonG.selectAll("path").data(previewPoison);

          previewPoisonScatter.exit().remove();

          previewPoisonScatter
            .attr("d", d3.symbol().type(d3.symbolCross).size(200))
            .attr("transform", (d) => `translate(${xScale(xValue(d))},${yScale(yValue(d))})`)
            .enter()
            .append("path")
            .attr("class", getClass)
            .attr("d", d3.symbol().type(d3.symbolCross).size(200))
            .attr("transform", (d) => `translate(${xScale(xValue(d))},${yScale(yValue(d))})`);
          break;
        case "erase":
          // if (poisons.length === 0) break;
          // if (poisonDelaunay === undefined)
          //   poisonDelaunay = d3.Delaunay.from(poisons.map((d) => d.x));

          // deleteIndex = poisonDelaunay.find(
          //   x,
          //   y,
          //   deleteIndex !== -1 ? deleteIndex : 0
          // );
          // if (sqrdist(poisons[deleteIndex].x, [x, y]) > 0.0025)
          //   deleteIndex = -1;
          // updateClasses();
          break;
        case "subpop-select":
          hoverIndex = delaunay.find(x, y);
          if (sqrdist(clusterCenters[hoverIndex], [x, y]) > 0.05) hoverIndex = -1;
          updateClasses();
          break;
      }
    };

    const clickHandler = (event) => {
      // if (attackAlgo !== "manual") return;

      let [x, y] = d3.pointer(event);
      (x -= margin.left), (y -= margin.top);
      [x, y] = [xScale.invert(x), yScale.invert(y)];

      switch (tools[action].name) {
        case "add":
          let poisonClip = [
            Math.min(Math.max(x, extentX[0]), extentX[1]),
            Math.min(Math.max(y, extentY[0]), extentY[1]),
          ];
          if (x >= extentXPad[0] && x <= extentXPad[1] && y >= extentYPad[0] && y <= extentYPad[1])
            insertPoison(poisonClip, poisonLabel);
          break;
        case "erase":
          // if (deleteIndex === -1) break;

          // // console.log(deleteIndex);
          // poisons.splice(deleteIndex, 1);
          // poisons.forEach((d, ix) => (d.id = ix));
          // poisonDelaunay = d3.Delaunay.from(poisons.map((d) => d.x));
          // deleteIndex = -1;

          // poisonG.selectAll("path").data(poisons).exit().remove();
          // poisonScatter = poisonG.selectAll("path");

          // retrainModels(false);
          break;
        case "subpop-select":
          if (hoverIndex !== -1 && hoverIndex !== spIndex) {
            spIndex = hoverIndex;
            subpop = dset.filter((d) => getClass(d) === "target-point").map((d) => d.x);
            if (attackAlgo !== "manual") {
              resetPoisons();
              retrainModels(false);
              configureAttackAlgorithm();
            }
            updateModels();
            updateClasses();
          }
          break;
      }
    };

    const mouseoutHandler = (event) => {
      hoverIndex = -1;
      deleteIndex = -1;
      updateClasses();

      previewPoisonScatter.data([]).exit().remove();
    };

    const regenerateDataset = () => {
      [dset, clusterCenters] = make_classification(nSamples, flip_y, class_sep, seed);

      subpop = dset.filter((d) => getClass(d) === "target-point").map((d) => d.x);

      delaunay = d3.Delaunay.from(clusterCenters);
      dsetScatter = dsetG.selectAll("circle").data(dset);
      dsetScatter
        .attr("class", getClass)
        .transition()
        .duration(250)
        .attr("cx", (d) => xScale(xValue(d)))
        .attr("cy", (d) => yScale(yValue(d)))
        .attr("r", (d) => getRadius(d));
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
          configureAttackAlgorithm();
          break;
        case "betaInput":
          flip_y = 0.1 * +betaSlider.node().value;
          betaText.text(`Random Label Fraction β = ${flip_y.toFixed(2)}`);
          break;
        case "betaChange":
          regenerateDataset();
          resetPoisons();
          retrainModels(true);
          configureAttackAlgorithm();
          break;
        case "algoSelector":
          attackAlgo = algoSelector.node().options[algoSelector.node().selectedIndex].text.toLowerCase();
          resetPoisons();
          retrainModels(false);
          if (attackAlgo === "manual") {
            manualButtons.property("style", false);
            algorithmButtons.attr("style", "display: none;");
            action = 0;
            attackInstance = undefined;
            toolButton.select("svg").select("path").attr("d", tools[action].path);
          } else {
            manualButtons.attr("style", "display: none;");
            algorithmButtons.property("style", false);
            action = 1;
            configureAttackAlgorithm();
          }

          if (attackAlgo !== "model-targeted") {
            targetModelStats.attr("class", "hidden");
            modelT.attr("class", "hidden");
          } else {
            targetModelStats.attr("class", "");
            modelT.attr("class", "");
          }
          break;
        case "seedButton":
          seed = Math.floor(Math.random() * 100000);
          seedField.node().value = seed;
          regenerateDataset();
          resetPoisons();
          retrainModels(true);
          configureAttackAlgorithm();
          break;
        case "seedField":
          seed = parseInt(seedField.node().value);
          seed = Math.min(Math.max(seed, 1), 100000);
          seedField.node().value = seed;
          regenerateDataset();
          resetPoisons();
          retrainModels(true);
          configureAttackAlgorithm();
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
          lossDifferenceText.innerHTML = "???";
          break;
        case "playButton":
          attackPaused = !attackPaused;
          playButton
            .select("svg")
            .select("path")
            .attr("d", !attackPaused ? svgPaths.pausePath : svgPaths.playPath);
          break;
      }
    };

    d3.select(canvas).on("mousemove", mousemoveHandler).on("click", clickHandler).on("mouseout", mouseoutHandler);

    alphaSlider.on("input", () => controlHandler("alphaInput")).on("change", () => controlHandler("alphaChange"));
    betaSlider.on("input", () => controlHandler("betaInput")).on("change", () => controlHandler("betaChange"));
    seedButton.on("click", () => controlHandler("seedButton"));
    seedField.on("change", () => controlHandler("seedField"));
    algoSelector.on("change", () => controlHandler("algoSelector"));
    labelButton.on("click", () => controlHandler("labelButton"));
    toolButton.on("click", () => controlHandler("toolButton"));
    resetButton.on("click", () => controlHandler("resetButton"));
    playButton.on("click", () => controlHandler("playButton"));
    algorithmResetButton.on("click", () => controlHandler("resetButton"));

    retrainModels(true);
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
    height={height - margin.bottom - margin.top}
    fill="white"
    stroke="#d3d3d3"
    stroke-width="2"
    rx="5"
  />
  <rect
    x={width - margin.right + 40}
    y={margin.top - 5}
    width={margin.right - 80}
    height={10}
    fill="white"
    stroke-width="0"
    border="none"
  />
</svg>
<div class="overlay" style="left: {width - margin.right + 20}px; width:{margin.right - 40}px; top:-12.5px;">
  <p class="unselectable" style="font-size: large; margin:0px; line-height:30px">Attack Statistics</p>
</div>

<div
  class="demo-stats-container"
  style="left: {width - margin.right + 20}px; top:{margin.top}px; width:{margin.right - 40}px; height:{innerHeight}px;"
>
  <div style="margin-top:18px; height:auto;">
    <p class="demo-stats-title">
      Clean Model
      <svg style="width: 32px; height:12px; vertical-align:middle;">
        <line style="stroke: darkgray; stroke-width: 16;" x1="0" x2="50" />
      </svg>
    </p>
    <div style="float:left;">
      <p class="demo-stats-entry">Overall accuracy:</p>
      <p class="demo-stats-entry">Subpop accuracy:</p>
    </div>
    <div class="demo-stats-entry" style="float:right;">
      <p bind:this={cOverallAccuracyText} class="demo-stats-entry right">0.0%</p>
      <p bind:this={cSubpopAccuracyText} class="demo-stats-entry right">0.0%</p>
    </div>
  </div>

  <div style="clear:both" />

  <div style="margin-top:24px;">
    <p class="demo-stats-title">
      Poisoned Model
      <svg style="width: 32px; height:12px; vertical-align:middle;">
        <line style="stroke: black; stroke-width: 16;" x1="0" x2="50" />
      </svg>
    </p>
    <div style="float:left;">
      <p class="demo-stats-entry">Overall accuracy:</p>
      <p class="demo-stats-entry">Subpop accuracy:</p>
      <p class="demo-stats-entry">Poisons:</p>
    </div>
    <div class="demo-stats-entry" style="float:right; ">
      <p bind:this={pOverallAccuracyTect} class="demo-stats-entry right">0.0%</p>
      <p bind:this={pSubpopAccuracyText} class="demo-stats-entry right">0.0%</p>
      <p bind:this={nPoisonsText} class="demo-stats-entry right">0</p>
    </div>
  </div>

  <div style="clear:both" />

  <div id="targetModelStats" class="hidden" style="margin-top:24px;">
    <p class="demo-stats-title">
      Target Model
      <svg style="width: 32px; height:12px; vertical-align:middle;">
        <line style="stroke: rgba(0,0,0,0.5); stroke-width: 16; stroke-dasharray: 4 4" x1="0" x2="50" />
      </svg>
    </p>
    <div style="float:left;">
      <p class="demo-stats-entry">Overall accuracy:</p>
      <p class="demo-stats-entry">Subpop accuracy:</p>
      <p class="demo-stats-entry">Loss-based distance:</p>
    </div>
    <div class="demo-stats-entry right" style="float:right;">
      <p bind:this={tOverallAccuracyText} class="demo-stats-entry right">0.0%</p>
      <p bind:this={tSubpopAccuracyText} class="demo-stats-entry right">0.0%</p>
      <p bind:this={lossDifferenceText} class="demo-stats-entry right">0.0</p>
    </div>
  </div>

  <div style="clear:both" />

  <div class="demo-stats-entry" style="position:absolute; bottom:10px">
    <b> Attack objective: </b>
    classify all orange points as positive (blue) label
  </div>
</div>
<canvas bind:this={canvas} {width} {height} />
