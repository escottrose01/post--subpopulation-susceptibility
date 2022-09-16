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

  const render = () => {
    let xScale = d3.scaleBand().domain(data.descriptions).range([0, innerWidth]).padding(0.2);
    let yScale = d3
      .scaleLinear()
      .range([innerHeight, 0])
      .domain([0, d3.max(data.difficulties, (d) => d)])
      .nice();

    let chartG = d3.select(svg).append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxis = d3.axisBottom(xScale).tickPadding(15);

    chartG
      .selectAll("mybar")
      .data(data.difficulties)
      .enter()
      .append("rect")
      .attr("x", (d, i) => xScale(data.descriptions[i]))
      .attr("y", (d) => yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d))
      .attr("fill", "#c64a23");

    let xAxisG = chartG.append("g").call(xAxis).attr("transform", `translate(0,${innerHeight})`);
    let yAxisG = chartG.append("g").call(d3.axisLeft(yScale));
    d3.select(svg)
      .append("text")
      .attr("class", "fig-title")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "baseline")
      .attr("x", innerWidth / 2 + margin.left)
      .attr("y", (2 * margin.top) / 3)
      .text(title ? title : "Adult Dataset Attack Difficulty");
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
      .text("Difficulty");

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
