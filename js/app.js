/* global App */
window.App = Ember.Application.create({
  ready: function() {
    console.log('hey d3!');

    // Binds instance_usage data to property
    this.set('instance_usage', this.instance_usage);
  }
});

// Future JSON data, but for the meantime, hardcoded

// A very un-exact example of instance usage data and in this prototype,
// we are happily assuming that we only have a single instance to our project.
// In a really real world scenario, we will retrieving the instance usage upon instance selection
// or if we are lucky enough, it might be included as part of the instance object itself.
App.instance_usage = {
  'inst_name' : 'Amazing Instance'
, 'graphs': [{
    'name'    : 'cpu'
  , 'capacity': 1000
  , 'consumed': 500
  , 'unit'    : 'GB' }
  , {
    'name'    : 'ram'
  , 'capacity': 1000
  , 'consumed': 100
  , 'unit'    : 'MB' }
  , {
    'name'    : 'io'
  , 'capacity': 1000
  , 'consumed': 500
  , 'unit'    : 'MB'
  }]
}

// Views
// Our customized view on
App.GraphView = Ember.View.extend({
  // Ember executes this method when the view is inserted in the DOM
  didInsertElement: function() {
    var element_id = this.get('elementId');

    console.log(element_id);

    // These are donut properties. I must find a way to clean this stuff.
    // DONUT PROPERTIES
    var width = 200;
    var height = 200;
    var radius =  Math.min(width, height) / 2;

    var dough = {
      name: "Default Project"
    , values: [50, 50]
    };

    var donut = d3.layout.pie().sort(null);
    var arc = d3.svg.arc()
      .startAngle(function(d){ return d.startAngle; })
      .endAngle(function(d){ return d.endAngle; })
      .innerRadius(radius * .6)
      .outerRadius(radius);

    // FOR LATER: Analyze how to map status to pie graph color
    // Colors for projects
    var colorScheme = d3.scale.ordinal()
      .domain(['neutral', 'green'])
      .range(['#fcfcfc', '#74c476']);

    var project = d3.select('#' + element_id).append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      .attr("viewBox", "0, 0, " + width + ", " + height)
      .attr("preserveAspectRatio", "xMinYMin");

      //Create a group where the slices of the pie will be part of
      var arc_group = project.append("svg:g")
        .attr("class", "arcGrp")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

      //Create a group where the label of each slice in the pie will be part of
      var label_group = project.append("svg:g")
        .attr("class", "lblGroup")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

      //Create a group for the inner circle in the pie
      var center_group = project.append("svg:g")
        .attr("class", "ctrGroup")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

      //CREATION OF ELEMENTS IN THE INNER CIRCLE
      //---------------------------------------------------------------------------
      //Create the inner circle
      var innerCircle = center_group.append("circle")
        .attr("fill", "white")
        .attr("r", radius * .6);

      //Add project label
      var pieLabel = center_group.append("svg:text")
        .attr("dy", "-10")
        .attr("class", "pieLabel")
        .attr("text-anchor", "middle")
        .text('50%');

      //CREATION OF SLICES & LABELS
      //---------------------------------------------------------------------------
      //Create the pie slices
      var arcs = arc_group.selectAll("path")
        .data(donut(dough.values));

      //Handle events and transitions on the pie slices
      arcs.enter().append("svg:path")
        .attr("fill", function(d, i) {return colorScheme(i);})
        .attr("d", arc)
        .attr("class", "slice")
        .each(function(d) {
          this._current = d;
        });

      arcs.transition()
        .ease("bounce")
        .duration(2000)
        .attrTween("d", tweenPie);

      function tweenPie(b) {
        b.innerRadius = 0;
        var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
        return function(t) {
          return arc(i(t));
        };
      }
  }
});

// Router
App.Router.map(function() {
  this.resource('graphs');
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('graphs')
  }
});
