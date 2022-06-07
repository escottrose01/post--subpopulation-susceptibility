<script>
  import { onMount } from "svelte";

  export let data;
  export let fID;

  let svg;
  let selectButton;

  const width = 704;
  const height = 584;
  const margin = { top: 40, right: 60, left: 60, bottom: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const sizeIx = 0;
  const cleanAccIx = 1;
  const cleanLossIx = 2;
  const lossDiffIx = 3;
  const difIx = 4;

  let xScale;
  let yScale;
  let xAxisG;
  let yAxisG;
  let scatterG;

  let xAxisLabel;
  let titleLabel;

  const update = (choice) => {
    let ix;
    switch (choice) {
      case "Subpop Size":
        ix = sizeIx;
        xAxisLabel.text("Size");
        titleLabel.text("Attack Difficulty vs. Subpopulation Size");
        break;
      case "Subpop Clean Accuracy":
        ix = cleanAccIx;
        xAxisLabel.text("Accuracy");
        titleLabel.text("Attack Difficulty vs. Subpopulation Clean Accuracy");
        break;
      case "Subpop Clean Loss":
        ix = cleanLossIx;
        xAxisLabel.text("Loss");
        titleLabel.text("Attack Difficulty vs. Subpopulation Clean Loss");
        break;
      case "Model Loss Difference":
        ix = lossDiffIx;
        xAxisLabel.text("Model Loss Difference");
        titleLabel.text("Attack Difficulty vs. Model Loss Difference");
        break;
      default:
        return;
    }

    let extentX = d3.extent(data, (d) => d[ix]);
    xScale = d3.scaleLinear().domain(extentX).range([0, innerWidth]);

    scatterG
      .selectAll("circle")
      .data(data)
      .attr("cx", (d) => xScale(d[ix]));

    let xAxis = d3.axisBottom(xScale).tickPadding(15);
    xAxisG.transition().duration(800).call(xAxis);
  };

  const render = () => {
    let extentX = d3.extent(data, (d) => d[0]);
    let extentY = d3.extent(data, (d) => d[difIx]);
    xScale = d3.scaleLinear().domain(extentX).range([0, innerWidth]);
    yScale = d3.scaleLinear().domain(extentY).range([innerHeight, 0]).nice();

    scatterG = d3.select(svg).append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxis = d3.axisBottom(xScale).tickPadding(15);

    scatterG
      .append("clipPath")
      .attr("id", `rect-clip${fID}`)
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", innerWidth + 10)
      .attr("height", innerHeight);

    scatterG
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d[0]))
      .attr("cy", (d) => yScale(d[difIx]))
      .attr("opacity", 0.05)
      .attr("fill", "steelblue")
      .attr("r", 4)
      .attr("clip-path", `url(#rect-clip${fID})`);

    xAxisG = scatterG.append("g").call(xAxis).attr("transform", `translate(0,${innerHeight})`);
    yAxisG = scatterG.append("g").call(d3.axisLeft(yScale));
    titleLabel = d3
      .select(svg)
      .append("text")
      .attr("class", "fig-title")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "baseline")
      .attr("x", innerWidth / 2 + margin.left)
      .attr("y", (2 * margin.top) / 3)
      .text("Attack Difficulty vs. Subpopulation Size");
    xAxisLabel = d3
      .select(svg)
      .append("text")
      .attr("class", "fig-label-text")
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2 + margin.left)
      .attr("y", innerHeight + margin.top + 45)
      .text("Size");
    d3.select(svg)
      .append("text")
      .attr("class", "fig-label-text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x", -margin.top - innerHeight / 2)
      .text("Difficulty");

    d3.select(selectButton).on("change", () => {
      let selectedOption = selectButton.options[selectButton.selectedIndex].text;
      update(selectedOption);
    });
  };

  onMount(() => {
    render();
  });
</script>

<select bind:this={selectButton} class="overlay" style="top:40px; left:{margin.left}px;">
  <option value="size">Subpop Size</option>
  <option value="cleanacc">Subpop Clean Accuracy</option>
  <option value="cleanloss">Subpop Clean Loss</option>
  <option value="lossdiff">Model Loss Difference</option>
</select>
<svg bind:this={svg} {width} {height} class="overlay unselectable" style="pointer-events: none;" />
<canvas class="unselectable" {width} {height} />
