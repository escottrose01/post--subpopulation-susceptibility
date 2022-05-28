<script>
  import { onMount } from "svelte";

  export let data;

  let svg;

  const width = 704;
  const height = 584;
  const margin = { top: 40, right: 60, left: 60, bottom: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  //   let slider;
  //   let initialized = false;

  let xScale;
  let yScale;
  let xAxisG;
  let yAxisG;
  let bins;
  let histogram;
  let histogramG;

  //   const update = (interval) => {
  //     if (!initialized) return;

  //     bins = histogram(data.filter((d) => interval[0] <= d[0] && d[0] <= interval[1]));

  //     yScale = d3
  //       .scaleLinear()
  //       .range([innerHeight, 0])
  //       .domain([0, d3.max(bins, (d) => d.length)])
  //       .nice();

  //     histogramG
  //       .selectAll("rect")
  //       .data(bins)
  //       .transition()
  //       .duration(500)
  //       .attr("transform", (d) => `translate(${xScale(d.x0)}, ${yScale(d.length)})`)
  //       .attr("width", (d) => xScale(d.x1) - xScale(d.x0) - 1)
  //       .style("fill", "steelblue")

  //       .attr("height", (d) => innerHeight - yScale(d.length));

  //     yAxisG.transition().duration(800).call(d3.axisLeft(yScale));
  //   };

  const render = () => {
    let extent = d3.extent(data, (d) => d);
    xScale = d3.scaleLinear().domain(extent).range([0, innerWidth]).nice();

    histogramG = d3.select(svg).append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxis = d3.axisBottom(xScale).tickPadding(15);

    histogram = d3
      .histogram()
      .value((d) => d)
      .domain(xScale.domain())
      .thresholds(xScale.ticks(20));

    bins = histogram(data);

    yScale = d3
      .scaleLinear()
      .range([innerHeight, 0])
      .domain([0, d3.max(bins, (d) => d.length)])
      .nice();

    histogramG
      .selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", 0.5)
      .attr("y", -0.5)
      .attr("transform", (d) => `translate(${xScale(d.x0)}, ${yScale(d.length)})`)
      .attr("width", (d) => xScale(d.x1) - xScale(d.x0) - 1)
      .attr("height", (d) => innerHeight - yScale(d.length))
      .style("fill", "steelblue");

    xAxisG = histogramG.append("g").call(xAxis).attr("transform", `translate(0,${innerHeight})`);
    yAxisG = histogramG.append("g").call(d3.axisLeft(yScale));
    d3.select(svg)
      .append("text")
      .attr("class", "fig-title")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "baseline")
      .attr("x", innerWidth / 2 + margin.left)
      .attr("y", (2 * margin.top) / 3)
      .text("Adult Dataset Attack Difficulty");
    d3.select(svg)
      .append("text")
      .attr("class", "fig-label-text")
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2 + margin.left)
      .attr("y", innerHeight + margin.top + 45)
      .text("Difficulty");
    d3.select(svg)
      .append("text")
      .attr("class", "fig-label-text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x", -margin.top - innerHeight / 2)
      .text("Frequency");

    // const scaleG = d3
    //   .select(svg)
    //   .append("g")
    //   .attr("transform", `translate(${margin.left - 20},${margin.top + innerHeight + 80})`);
    // const scale = d3
    //   .scaleLinear()
    //   .domain([0.48, 1])
    //   .range([0, innerWidth + 40])
    //   .nice();
    // scaleG.append("text").attr("class", "fig-label-text").attr("y", -10).text("Clean Model Accuracy");
    // scaleG
    //   .append("g")
    //   .attr("transform", "translate(0, 30)")
    //   .attr("class", "colorbar")
    //   .call(d3.axisBottom(scale).tickSize(6).tickPadding(5));

    // initialized = true;

    // initSlider();
  };

  //   const initSlider = () => {
  //     const N = 1000000;
  //     const t0 = 0.48;
  //     slider = createD3RangeSlider(0, N, "#slider-container");
  //     slider.onChange((range) => {
  //       update([t0 + ((1 - t0) * range.begin) / N, t0 + ((1 - t0) * range.end) / N]);
  //     });
  //     slider.range(0, 0.1 * N);
  //   };

  onMount(() => {
    render();
  });
</script>

<svg bind:this={svg} {width} {height} class="overlay unselectable" style="tick" />
<canvas class="unselectable" {width} {height} />
<!-- <div class="overlay histogram-slider" style="top:{margin.top + innerHeight + 80}px;">
    <div id="slider-container" style="width:100%; height:100%; pointer-events: visible;" />
  </div> -->
