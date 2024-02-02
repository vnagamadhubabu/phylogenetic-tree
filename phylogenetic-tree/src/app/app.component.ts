import { HttpClient } from '@angular/common/http';
import {  Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import * as d3 from 'd3';


interface ShowLengthForm extends HTMLFormElement {
  i: HTMLInputElement;
  value: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  private timeout: any;


  parseNewick(a: string): any {

    console.log("data A : "+a)
    for (var e: any[] = [], r: any = {}, s = a.split(/\s*(;|\(|\)|,|:)\s*/), t = 0; t < s.length; t++) {
      console.log(".,.")
      var n = s[t];
      switch (n) {
        case "(":
          var c: any = {};
          r.branchset = [c], e.push(r), r = c;
          break;
        case ",":
          var c: any = {};
          e[e.length - 1].branchset.push(c), r = c;
          break;
        case ")":
          r = e.pop();
          break;
        case ":":
          break;
        default:
          var h = s[t - 1];
          ")" == h || "(" == h || "," == h ? r.name = n : ":" == h && (r.length = parseFloat(n));
      }
    }
    console.log(JSON.parse(JSON.stringify(r)));
    return r;
  }

  constructor(private http:HttpClient,private renderer: Renderer2, private el: ElementRef){

  }

  // Function to parse Newick format

  width = 954;
  outerRadius = this.width / 2;
  innerRadius = this.outerRadius - 170;
  data:any;
  phylogeneticChart: any; 
 
  async ngOnInit(): Promise<void> {
    console.log(this.data)
 
    this.http.get('assets/life.txt', { responseType: 'text' })
      .subscribe(async data =>{
      
        this.data = this.parseNewick(await data);
        this.phylogeneticChart = this.chart();

        // Call the update function with the initial value
        this.phylogeneticChart.update(true);
  
     
      },error=>{
        console.log("It's Okey")
      } );
      

      this.timeout = setTimeout(() => {
        const checkbox = this.el.nativeElement.querySelector('input[name="i"]');
        checkbox.checked = true;
        this.onCheckboxChange({ target: checkbox });
      }, 2000);

  }
  ngOnDestroy() {
    clearTimeout(this.timeout);
  }


  onCheckboxChange(event: any) {
    clearTimeout(this.timeout);
    const checked = event.target.checked;

    // Call the update function from the stored chart instance
    this.phylogeneticChart.update(checked);

    // Additional logic if needed
  }
  
  title = 'phylogenetic-tree';
  // parseNewick(a: any): any {
  //   for (var e = [], r: any, s = a.split(/\s*(;|\(|\)|,|:)\s*/), t = 0; t < s.length; t++) {
  //     console.log(s);
  //     var n = s[t];
  //     console.log(n);
  //     switch (n) {
  //       case "(":
  //         var c = {};
  //         r.branchset = [c];
  //         e.push(r);
  //         r = c;
  //         break;
  //       case ",":
  //         var c = {};
  //         e[e.length - 1].branchset.push(c);
  //         r = c;
  //         break;
  //       case ")":
  //         r = e.pop();
  //         break;
  //       case ":":
  //         break;
  //       default:
  //         var h = s[t - 1];
  //         ")" == h || "(" == h || "," == h ? (r.name = n) : ":" == h && (r.length = parseFloat(n));
  //     }
  //   }
  //   alert(r)
  //   return r;
  // }
 
  chart = ()=>{

   var width = 954;
   var outerRadius = this.width / 2;
   var innerRadius = this.outerRadius - 170;
     
  var cluster = d3.cluster()
  .size([360, this.innerRadius])
  .separation((a, b) => 1)

  var color = d3.scaleOrdinal()
  .domain(["Bacteria", "Eukaryota", "Archaea"])
  .range(d3.schemeCategory10) 


 function maxLength (d: any): any {
  if (d && d.data) {
    return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
  } else {
    return 0; // or handle the case when d or d.data is undefined/null
  }
}

 function setRadius(d:any, y0:any, k:any) {
  d.radius = (y0 += d.data.length) * k;
  if (d.children) d.children.forEach((d: any) => setRadius(d, y0, k));
}
function setColor(d: any)  {
  var name = d.data.name;
  d.color = color.domain().indexOf(name) >= 0 ? color(name) : d.parent ? d.parent.color : null;
  if (d.children) d.children.forEach(setColor);
}

 function linkVariable(d:any) {
  function linkStep(startAngle:any, startRadius:any, endAngle:any, endRadius:any) {
    const c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI);
    const s0 = Math.sin(startAngle);
    const c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI);
    const s1 = Math.sin(endAngle);
    return "M" + startRadius * c0 + "," + startRadius * s0
        + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
        + "L" + endRadius * c1 + "," + endRadius * s1;
  }
  return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
}
function linkConstant(d:any) {
  function linkStep(startAngle:any, startRadius:any, endAngle:any, endRadius:any) {
    const c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI);
    const s0 = Math.sin(startAngle);
    const c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI);
    const s1 = Math.sin(endAngle);
    return "M" + startRadius * c0 + "," + startRadius * s0
        + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
        + "L" + endRadius * c1 + "," + endRadius * s1;
  }
  return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
}
function linkExtensionVariable(d:any) {
  function linkStep(startAngle:any, startRadius:any, endAngle:any, endRadius:any) {
    const c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI);
    const s0 = Math.sin(startAngle);
    const c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI);
    const s1 = Math.sin(endAngle);
    return "M" + startRadius * c0 + "," + startRadius * s0
        + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
        + "L" + endRadius * c1 + "," + endRadius * s1;
  }
  return linkStep(d.target.x, d.target.radius, d.target.x, innerRadius);
}
function linkExtensionConstant(d:any) {
  function linkStep(startAngle:any, startRadius:any, endAngle:any, endRadius:any) {
    const c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI);
    const s0 = Math.sin(startAngle);
    const c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI);
    const s1 = Math.sin(endAngle);
    return "M" + startRadius * c0 + "," + startRadius * s0
        + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
        + "L" + endRadius * c1 + "," + endRadius * s1;
  }
  return linkStep(d.target.x, d.target.y, d.target.x, innerRadius);
}

var legend = (svg:any) => {
  const g = svg
    .selectAll("g")
    .data(color.domain())
    .join("g")
      .attr("transform", (d:any, i:any) => `translate(${-this.outerRadius},${-this.outerRadius + i * 20})`);

  g.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", color);

  g.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .text((d: any) => d);
}

    console.log("chart called")
    console.log(this.data)
    const root = d3.hierarchy(this.data, d => d.branchset)
        .sum(d => d.branchset ? 0 : 1)
        .sort((a, b) => (a.value! - b.value!) || d3.ascending(a.data.length, b.data.length));
  
    cluster(root);
    setRadius(root, root.data.length = 0, this.innerRadius / maxLength(root));
    setColor(root);
  
    const svg = d3.create("svg")
        .attr("viewBox", [-this.outerRadius, -this.outerRadius, this.width, this.width])
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);
       
  
    svg.append("g")
        .call(legend);
  
    svg.append("style").text(`
  
  .link--active {
    stroke: #000 !important;
    stroke-width: 1.5px;
  }
  
  .link-extension--active {
    stroke-opacity: .6;
  }
  
  .label--active {
    font-weight: bold;
  }
  
  `);
  
    const linkExtension = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.25)
      .selectAll("path")
      .data(root.links().filter(d => !d.target.children))
      .join("path")
        .each(function(d:any) { d.target.linkExtensionNode = this; })
        .attr("d", linkExtensionConstant);
  
    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#000")
      .selectAll("path")
      .data(root.links())
      .join("path")
        .each(function(d:any) { d.target.linkNode = this; })
        .attr("d", linkConstant)
        .attr("stroke", (d:any) => d.target.color);
  
    svg.append("g")
      .selectAll("text")
      .data(root.leaves())
      .join("text")
        .attr("dy", ".31em")
        .attr("transform", (d:any) => `rotate(${d.x - 90}) translate(${this.innerRadius + 4},0)${d.x < 180 ? "" : " rotate(180)"}`)
        .attr("text-anchor", (d:any) => d.x < 180 ? "start" : "end")
        .text(d => d.data.name.replace(/_/g, " "))
        .on("mouseover", mouseovered(true))
        .on("mouseout", mouseovered(false));
 
        function mouseovered(active: any) {
          return function(this: any, event: any, d: any) {
            d3.select(this).classed("label--active", active);
            d3.select(d.linkExtensionNode).classed("link-extension--active", active).raise();
            do d3.select(d.linkNode).classed("link--active", active).raise();
            while (d = d.parent);
          };
        }
 
    // function update  (checked: boolean)  {
    //   checked=false;
    //   const t = d3.transition().duration(750);
    //   linkExtension.transition(t).attr("d", checked ? linkExtensionVariable : linkExtensionConstant);
    //   link.transition(t).attr("d", checked ? linkVariable : linkConstant);
    // }
    function update(checked: boolean): void {
      const t = d3.transition().duration(750);
    
      const linkExtensionTransition = checked ? linkExtensionVariable : linkExtensionConstant;
      const linkTransition = checked ? linkVariable : linkConstant;
    
      linkExtension.transition(t).attr("d", linkExtensionTransition);
      link.transition(t).attr("d", linkTransition);
    }
    
    document.getElementById('svg')!.appendChild(svg.node()!);
 
    return Object.assign(svg.node()!, {update});
  }
  // update = this.chart.update(showLength);
 
  


}

