<script>
  import { onMount } from "svelte";

  export let data;
  export let title;

  let svg;

  const width = 704;
  const height = 584;
  const margin = { top: 40, right: 60, left: 60, bottom: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const features = ["Ambient Positivity", "Model Loss Difference"];

  const render = () => {
    let xScale0 = d3.scaleBand().domain(data.descriptions).range([0, innerWidth]).padding(0.4);
    let xScale1 = d3.scaleBand().domain(features).range([0, xScale0.bandwidth()]);

    let yScaleLeft = d3
      .scaleLinear()
      .range([innerHeight, 0])
      .domain([0, d3.max(data.positivities, (d) => d)])
      .nice();
    let yScaleRight = d3
      .scaleLinear()
      .range([innerHeight, 0])
      .domain([0, d3.max(data.loss_diffs, (d) => d)])
      .nice();

    const color = d3.scaleOrdinal().domain(features).range(["steelblue", "#ff7f00"]);

    let chartG = d3.select(svg).append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxis = d3.axisBottom(xScale0).tickPadding(15);

    chartG
      .selectAll("mybar")
      .data(data.positivities)
      .enter()
      .append("rect")
      .attr("x", (d, i) => xScale0(data.descriptions[i]) + xScale1("Ambient Positivity"))
      .attr("y", (d) => yScaleLeft(d))
      .attr("width", xScale0.bandwidth() / 2)
      .attr("height", (d) => innerHeight - yScaleLeft(d))
      .attr("fill", color("Ambient Positivity"));

    chartG
      .selectAll("mybar")
      .data(data.loss_diffs)
      .enter()
      .append("rect")
      .attr("x", (d, i) => xScale0(data.descriptions[i]) + xScale1("Model Loss Difference"))
      .attr("y", (d) => yScaleRight(d))
      .attr("width", xScale0.bandwidth() / 2)
      .attr("height", (d) => innerHeight - yScaleRight(d))
      .attr("fill", color("Model Loss Difference"));

    let xAxisG = chartG.append("g").call(xAxis).attr("transform", `translate(0,${innerHeight})`);
    let yAxisGLeft = chartG.append("g").call(d3.axisLeft(yScaleLeft));
    let yAxisGRight = chartG
      .append("g")
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(d3.axisRight(yScaleRight));
    if (title)
      d3.select(svg)
        .append("text")
        .attr("class", "fig-title")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "baseline")
        .attr("x", innerWidth / 2 + margin.left)
        .attr("y", (2 * margin.top) / 3)
        .text(title);
    d3.select(svg)
      .append("text")
      .attr("class", "fig-label-text")
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2 + margin.left)
      .attr("y", innerHeight + margin.top + 90)
      .text("Subpopulation");
    d3.select(svg)
      .append("text")
      .attr("class", "fig-label-text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x", -margin.top - innerHeight / 2)
      .text("Positivity");
    d3.select(svg)
      .append("text")
      .attr("class", "fig-label-text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(90)")
      .attr("y", -margin.left - innerWidth - 40)
      .attr("x", margin.top + innerHeight / 2)
      .text("Loss Difference");

    let legend = d3
      .select(svg)
      .selectAll(".legend")
      .data(features)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0, ${margin.top + i * 20})`);
    legend
      .append("rect")
      .attr("x", innerWidth - 48)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);
    legend
      .append("text")
      .attr("x", innerWidth - 54)
      .attr("y", 9)
      .attr("dy", ".3em")
      .style("text-anchor", "end")
      .text((d) => d);

    const insertLinebreaks = function (d) {
      d = d.toString();
      let el = d3.select(this);
      let words = d.split("\n");
      el.text("");

      for (var i = 0; i < words.length; i++) {
        var tspan = el.append("tspan").text(words[i]);
        if (i > 0) tspan.attr("x", 0).attr("dy", "15");
      }
    };

    chartG.selectAll("text").each(insertLinebreaks);
  };

  onMount(() => {
    render();
  });
</script>

<svg bind:this={svg} {width} {height} class="overlay unselectable" style="tick" />
<canvas class="unselectable" {width} {height} />
