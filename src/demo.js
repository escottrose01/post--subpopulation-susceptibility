import * as d3 from "d3";

var options = {
  class_sep: 1,
  flip_y: 0,
};

var format = d3.format(",");
var data = [0, 0.005, 0.01, 0.015, 0.02, 0.025];

var slider = d3
  .sliderBottom()
  .min(d3.min(data))
  .max(d3.max(data))
  .width(300)
  .tickFormat(d3.format(".2"))
  .ticks(5)
  .default("0.015")
  .on("onchange", (val) => {
    d3.select("p#slider-value").text(d3.format(".2")(val));
  });

var gSimple = d3
  .select("div#slider")
  .append("svg")
  .attr("width", 500)
  .attr("height", 100)
  .append("g")
  .attr("transform", "translate(30,30)");

gSimple.call(slider);
d3.select("p#value-simple").text(d3.format(".2")(slider.value()));
