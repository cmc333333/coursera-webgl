var App = {
  initGL: function() {
    canvas = document.getElementById("gl-canvas");
    this.gl = WebGLUtils.setupWebGL(canvas);
    if (!this.gl) { alert( "WebGL isn't available" ); }
    
    //  Configure WebGL
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    this.program = initShaders(this.gl, "vertex-shader", "fragment-shader");
    this.gl.useProgram(this.program);

    this.setupLocs();
  },
  setupLocs: function() {
    this.locs.vNormal = this.gl.getAttribLocation(this.program, "vNormal");
    this.locs.vPosition = this.gl.getAttribLocation(this.program, "vPosition");
    this.locs.ambientProduct = this.gl.getUniformLocation(this.program, "ambientProduct");
    this.locs.diffuseProduct = this.gl.getUniformLocation(this.program, "diffuseProduct");
    this.locs.specularProduct = this.gl.getUniformLocation(this.program, "specularProduct");
    this.locs.lightPosition = this.gl.getUniformLocation(this.program, "lightPosition");
    this.locs.shininess = this.gl.getUniformLocation(this.program, "shininess");
    this.locs.projectionMatrix = this.gl.getUniformLocation(this.program, "projectionMatrix");



var pointsArray = [];
var normalsArray = [];

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

//var materialAmbient = vec4( 0, 0, 0, 1.0 );
//var materialDiffuse = vec4( 0, 0, 0, 1.0);
//var materialSpecular = vec4( 0, 0, 0, 1.0 );

var viewerPos;

function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);
     normal = normalize(normal);

     pointsArray.push(vertices[a]); 
     pointsArray.push(vertices[b]); 
     pointsArray.push(vertices[c]); 
     pointsArray.push(vertices[a]);  
     pointsArray.push(vertices[c]); 
     pointsArray.push(vertices[d]); 
     for (var i = 0; i < 6; i++) {
       normalsArray.push(normal);    
     }
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}
    colorCube();
    normalsArray = App.shapes.sphere.normals;
    pointsArray = App.shapes.sphere.triangles;

    var nBuffer = this.gl.createBuffer();
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, nBuffer );
    this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(normalsArray), this.gl.STATIC_DRAW );
    
    this.gl.vertexAttribPointer(this.locs.vNormal, 3, this.gl.FLOAT, false, 0, 0 );
    this.gl.enableVertexAttribArray(this.locs.vNormal );

    var vBuffer = this.gl.createBuffer();
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, vBuffer );
    this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(pointsArray), this.gl.STATIC_DRAW );
    
    this.gl.vertexAttribPointer(this.vPosition, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.vPosition);

    viewerPos = vec3(0.0, 0.0, -20.0 );

    var projection = ortho(-1, 1, -1, 1, -100, 100);
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    this.gl.uniform4fv(this.locs.ambientProduct, flatten(ambientProduct));
    this.gl.uniform4fv(this.locs.diffuseProduct, flatten(diffuseProduct) );
    this.gl.uniform4fv(this.locs.specularProduct, flatten(specularProduct) );	
    this.gl.uniform4fv(this.locs.lightPosition, 
        [1, 1, 1, 0,
         -1, 1, 1, 0]);
       
    this.gl.uniform1f(this.locs.shininess, materialShininess);
    
    this.gl.uniformMatrix4fv(this.locs.projectionMatrix, false, flatten(projection));
    
  },
  locs: {},
  shapes: {
    cone: Shapes.Cone(24),
    cylinder: Shapes.Cylinder(24),
    sphere: Shapes.Sphere(24)
  },
  elements: [],
  current: function() {
    var result = {
      color: this.color(),
      shape: this.shape(),
      transform: 
        mult(translate(this.positionX(), this.positionY(), this.positionZ()),
        mult(rotate(this.rotateX(), 1, 0, 0),
        mult(rotate(this.rotateY(), 0, 1, 0),
        mult(rotate(this.rotateZ(), 0, 0, 1),
             scale(this.skewX(), this.skewY(), this.skewZ())))))
    };
    return result;
  },
  sendData: function(el, wireframe, transformLoc, ambientLoc) {
    var shape = this.shapes[el.shape],
        ambientProduct = mult(
          vec4(this.ambientR(), this.ambientG(), this.ambientB(), 1.0),
          el.color);

    this.gl.uniform4fv(ambientLoc, flatten(ambientProduct));
    if (this.perspective()) {
      this.gl.uniformMatrix4fv(transformLoc, false, flatten(
        mult(perspective(80, 1, 0.1, -1),
        mult(translate(0, 0, -1.1),
             el.transform))));
    } else {
      this.gl.uniformMatrix4fv(transformLoc, false, flatten(
        mult(ortho(-1, 1, -1, 1, -2, 2),
             el.transform)));
    };
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(shape.vertices),
                       this.gl.STATIC_DRAW);
    if (wireframe) {
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
                         new Uint16Array(shape.wireframe),
                         this.gl.STATIC_DRAW);
      this.gl.drawElements(this.gl.LINES, shape.wireframe.length,
                           this.gl.UNSIGNED_SHORT, 0);
    } else {
      for (var i = 0; i < shape.faces.length; i++) {
        var face = shape.faces[i];
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
                           new Uint16Array(face.indices),
                           this.gl.STATIC_DRAW);
        this.gl.drawElements(this.gl[face.mode], face.indices.length,
                             this.gl.UNSIGNED_SHORT, 0);
      }
    }
  },
  render: function() {
    this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            
    var modelView = mat4();
    var modelView = mult(rotate(this.rotateX(), 1, 0, 0), modelView);
    
    this.gl.uniformMatrix4fv( this.gl.getUniformLocation(this.program,
            "modelViewMatrix"), false, flatten(modelView) );
    var now = new Date().getTime() / 500;
    this.gl.uniform4fv(this.locs.lightPosition,
                       [Math.sin(now), Math.cos(now), this.positionZ(), 0.0]);

    this.gl.drawArrays( this.gl.TRIANGLES, 0, this.shapes.sphere.triangles.length);
    requestAnimFrame(App.render.bind(App));

  },
  render_old: function() {
    var transformLoc = this.gl.getUniformLocation(this.program, "transform"),
        ambientLoc = this.gl.getUniformLocation(this.program, "ambientProduct");
        editing = this.current();

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    for (var i = 0; i < this.elements.length; i++) {
      this.sendData(this.elements[i], false, transformLoc, ambientLoc);
    }
    this.sendData(editing, true, transformLoc, ambientLoc);
  },
  placeObject: function() {
    this.elements.push(this.current());
    //this.render();
  },
  exportData: function() {
    var json = JSON.stringify(this.elements);
    window.open("data:application/json," + json);
  },
  loadData: function(file) {
    var reader = new FileReader();
    reader.onload = function() {
      var elements = JSON.parse(reader.result);
      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        element.transform.matrix = true;
        App.elements.push(element);
      };
      //App.render();
    };
    reader.readAsText(file);
  }
}

$(function() {
  var valOf = function(search) { return function() { return $(search).val(); }},
      $perspective = $('#perspective'),
      $colors = $('input.color'),
      $import = $('#import'),
      $export = $('#export');

  App.initGL();
  App.rotateX = valOf('#rotate_x');
  App.rotateY = valOf('#rotate_y');
  App.rotateZ = valOf('#rotate_z');
  App.positionX = valOf('#position_x');
  App.positionY = valOf('#position_y');
  App.positionZ = valOf('#position_z');
  App.skewX = valOf('#skew_x');
  App.skewY = valOf('#skew_y');
  App.skewZ = valOf('#skew_z');
  App.shape = function() { return $('input[name=shape]:checked').val(); };
  App.perspective = function() { return $perspective.is(':checked'); }
  App.color = function() {
    var $selected = $colors.filter('.selected'),
        colorStr = $selected.css('background-color').slice(4, -1),
        components = colorStr.split(', ');
    components.push(255);
    return $.map(components, function(v) { return parseInt(v)/255; });
  };
  App.ambientR = function() { return parseInt($('#ambient_r').val())/255; };
  App.ambientG = function() { return parseInt($('#ambient_g').val())/255; };
  App.ambientB = function() { return parseInt($('#ambient_b').val())/255; };
  App.render();

  /*
  $('input[type=range]').on("input change", App.render.bind(App));
  $('input[name=shape]').click(App.render.bind(App));
  $perspective.click(App.render.bind(App));
  */
  $('#place').click(App.placeObject.bind(App));
  $colors.click(function() {
    $colors.removeClass('selected');
    $(this).addClass('selected');
    //App.render();
  });
  if (window.File && window.FileList && window.FileReader) {
    $export.click(App.exportData.bind(App));
    $import.change(function(ev) {
      App.loadData(ev.target.files[0]);
    });
  } else {
    $('[data-tab-body=import-export]').html(
      "<strong>Sorry, your browser does not support import/export");
  }
});
