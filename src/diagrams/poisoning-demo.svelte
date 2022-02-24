<script>
  import { onMount } from "svelte";
  // import { SVM } from "libsvm-js";
  import { make_classification, getModelShape } from "../util.js";

  export let fID;
  export let controls;

  let canvas;
  let svg;
  let resetButton;
  let alphaSlider;
  let betaSlider;
  let seedSlider;
  let alphaText;
  let betaText;
  let seedText;

  let flip_y = 0.0;
  let class_sep = 1.0;
  let seed = 1;
  const n_samples = 128;

  let dset = make_classification(n_samples, flip_y, class_sep, seed);
  let svm;
  let sp_index = 0;
  let hover_index = -1;
  let action = "add";
  let poisonLabel = 1;

  let poisons = [];
  let previewPoison = [];

  const width = 984;
  const height = 450;

  const resetPath = "M 0 0";

  const render = () => {
    const xValue = (p) => p.x[0];
    const yValue = (p) => p.x[1];
    const getClass = (p) => {
      if (p.subpops == undefined)
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

    alphaSlider = d3.select(controls).select("#alphaSlider");
    betaSlider = d3.select(controls).select("#betaSlider");
    seedSlider = d3.select(controls).select("#seedSlider");

    alphaText = d3.select(controls).selectAll("svg").select("#alphaText");
    betaText = d3.select(controls).selectAll("svg").select("#betaText");
    seedText = d3.select(controls).selectAll("svg").select("#seedText");

    //--- figure interaction control ---//
    const updateClasses = () => {
      poisonScatter.attr("class", getClass);
      dsetScatter.attr("class", getClass);
    };

    const resetPoisons = () => {
      poisons = [];
      poisonScatter = poisonG.selectAll("path").data(poisons).exit().remove();
    };

    // const updateModels = () => {
    //   let modelShape;
    //   let theta_c = data.attacks[sp_index].im_models[0];
    //   let theta_t = data.attacks[sp_index].im_models[poisonIndex];

    //   modelShape = getModelShape(theta_c, extentX, extentY);
    //   model_c
    //     .attr("x1", xScale(modelShape.boundary[0][0]))
    //     .attr("x2", xScale(modelShape.boundary[1][0]))
    //     .attr("y1", yScale(modelShape.boundary[0][1]))
    //     .attr("y2", yScale(modelShape.boundary[1][1]));

    //   modelShape = getModelShape(theta_t, extentX, extentY);
    //   model_t
    //     .attr("x1", xScale(modelShape.boundary[0][0]))
    //     .attr("x2", xScale(modelShape.boundary[1][0]))
    //     .attr("y1", yScale(modelShape.boundary[0][1]))
    //     .attr("y2", yScale(modelShape.boundary[1][1]));
    //   belowArea
    //     .attr("d", line(modelShape.below))
    //     .attr("class", theta_t[1] < 0 ? "area-blue" : "area-red");
    //   aboveArea
    //     .attr("d", line(modelShape.above))
    //     .attr("class", theta_t[1] < 0 ? "area-red" : "area-blue");
    // };

    const mousemoveHandler = (event) => {
      let [x, y] = d3.pointer(event);
      (x -= margin.left), (y -= margin.top);
      [x, y] = [xScale.invert(x), yScale.invert(y)];
      let poison = [x, y];

      switch (action) {
        case "add":
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
      }
      updateClasses();
    };

    const clickHandler = (event) => {
      let [x, y] = d3.pointer(event);
      (x -= margin.left), (y -= margin.top);
      [x, y] = [xScale.invert(x), yScale.invert(y)];
      let poison = [x, y];

      switch (action) {
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
          }
          break;
      }

      console.log(poisons);
    };

    const mouseoutHandler = (event) => {
      hover_index = -1;
      updateClasses();

      previewPoisonScatter.data([]).exit().remove();
    };

    const regenerateDataset = () => {
      dset = make_classification(n_samples, flip_y, class_sep, seed);
      dsetScatter = dsetG.selectAll("circle").data(dset);
      dsetScatter
        .data(dset)
        .attr("class", getClass)
        .transition()
        .duration(250)
        .attr("cx", (d) => xScale(xValue(d)))
        .attr("cy", (d) => yScale(yValue(d)));
      dsetScatter.exit().remove();
    };

    const sliderHandler = (slider) => {
      switch (slider) {
        case "alpha":
          class_sep = 0.25 * +alphaSlider.node().value;
          alphaText.text(`Class Separation α = ${class_sep.toFixed(2)}`);
          break;
        case "beta":
          flip_y = 0.1 * +betaSlider.node().value;
          betaText.text(`Random Label Fraction β = ${flip_y.toFixed(2)}`);
          break;
        case "seed":
          seed = +seedSlider.node().value;
          seedText.text(`Dataset Seed s = ${seed}`);
          break;
      }
      regenerateDataset();
      // resetPoisons();
    };

    d3.select(canvas)
      .on("mousemove", mousemoveHandler)
      .on("click", clickHandler)
      .on("mouseout", mouseoutHandler);

    alphaSlider.on("input", () => sliderHandler("alpha"));
    betaSlider.on("input", () => sliderHandler("beta"));
    seedSlider.on("change", () => sliderHandler("seed"));
  };

  onMount(() => {
    render();
  });
</script>

<svg bind:this={svg} {width} {height} class="overlay" />
<canvas bind:this={canvas} {width} {height} />
