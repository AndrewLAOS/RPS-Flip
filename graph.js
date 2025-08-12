// graph.js
import { items } from './items.js';

export function initGraph() {
  const width = 900, height = 600;

  const svg = d3.select("#graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const nodes = Object.keys(items).map(name => ({
    id: name,
    rarity: items[name].rarity
  }));

  const links = [];
  for (let [name, data] of Object.entries(items)) {
    data.beats.forEach(target => {
      links.push({
        source: name,
        target: target,
        type: getLinkType(items[name].rarity, items[target].rarity)
      });
    });
  }

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(150))
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg.append("g")
    .attr("stroke-width", 2)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", d => linkColor(d.type));

  const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 18)
    .attr("fill", d => rarityGradient(d.rarity))
    .call(drag(simulation));

  const label = svg.append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .text(d => d.id)
    .attr("font-size", 12)
    .attr("dy", -25);

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    label
      .attr("x", d => d.x)
      .attr("y", d => d.y);
  });
}

function getLinkType(sourceRarity, targetRarity) {
  const diff = rarityValue(sourceRarity) - rarityValue(targetRarity);
  if (diff >= 2) return "strong";
  if (diff <= -2) return "rare-counter";
  return "normal";
}

function linkColor(type) {
  if (type === "strong") return "green";
  if (type === "rare-counter") return "red";
  return "yellow";
}

function rarityValue(rarity) {
  const order = ["Common","Uncommon","Rare","Epic","Legendary","Mythic"];
  return order.indexOf(rarity);
}

function rarityGradient(rarity) {
  const gradients = {
    Common: "#777",
    Uncommon: "#4caf50",
    Rare: "#2196f3",
    Epic: "#9c27b0",
    Legendary: "#ff9800",
    Mythic: "#e91e63"
  };
  return gradients[rarity] || "#ccc";
}

function drag(simulation) {
  return d3.drag()
    .on("start", event => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    })
    .on("drag", event => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    })
    .on("end", event => {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    });
}
