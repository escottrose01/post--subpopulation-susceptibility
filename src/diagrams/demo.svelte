<script>
  import { onMount } from "svelte";

  var data = [30, 60, 120];

  let el;

  onMount(() => {
    d3.select(el)
      .selectAll("div")
      .data(data)
      .enter()
      .append("div")
      .style("width", (d) => {
        return d + "px";
      })
      .text((d) => {
        return d;
      });
  });
</script>

<div bind:this={el} class="chart">
  <p>Hello!</p>
</div>

<style>
  .chart :global(div) {
    font: 10px sans-serif;
    background-color: steelblue;
    text-align: right;
    padding: 3px;
    margin: 1px;
    color: white;
  }
</style>
