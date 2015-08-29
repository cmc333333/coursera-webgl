var App = {
  init: function() {
    var canvas = document.getElementById("gl-canvas"),
        earthImg = new Image();
    this.gl = WebGLUtils.setupWebGL(canvas);
    if (!this.gl) { alert( "WebGL isn't available" ); }
    
    //  Configure WebGL
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.gl.clearColor(0.5, 0.5, 0.5, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    this.program = initShaders(this.gl, "vertex-shader", "fragment-shader");
    this.gl.useProgram(this.program);

    this.sendPoints();
    this.sendTexCoords();
    this.sendGrid(this.mkCheckerboard(128, 64), 0, 64, 128);
    this.sendCube(this.mkCheckerboard(64, 64), 1);
    earthImg.onload = function() {
      App.sendGrid(earthImg, 2);
      App.render();
    };
    earthImg.src = "earth.jpg";
  },
  sphere: Shapes.Sphere(20),
  sendPoints: function() {
    var pointsArray = this.sphere.triangles,
        vPosition = this.gl.getAttribLocation(this.program, "vPosition");

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(pointsArray),
                       this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(vPosition, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(vPosition);
  },
  sendTexCoords: function() {
    var texCoords = this.sphere.texCoords,
        vTexCoord = this.gl.getAttribLocation(this.program, "vTexCoord");

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(texCoords),
                       this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(vTexCoord, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(vTexCoord);
  },
  mkCheckerboard: function(rows, cols) {
    var imgData = new Uint8Array(4*rows*cols);

    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        var c = (((i & 0x8) === 0) ^ ((j & 0x8)  === 0));
        imgData[4*cols*i + 4*j] = 255*c;
        imgData[4*cols*i + 4*j + 1] = 255*c;
        imgData[4*cols*i + 4*j + 2] = 255*c;
        imgData[4*cols*i + 4*j + 3] = 255;
      }
    }
    return imgData;
  },
  sendCube: function(imgData, idx) {
    var texture = this.gl.createTexture(),
        texLoc = this.gl.getUniformLocation(this.program, 'tex' + idx);

    this.gl.activeTexture(this.gl['TEXTURE' + idx]);
    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    for (i = 0; i < 6; i++) {
      this.gl.texImage2D(
        this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, this.gl.RGBA, 64, 64, 0,
        this.gl.RGBA, this.gl.UNSIGNED_BYTE, imgData);
    }
    this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, 
                          this.gl.NEAREST_MIPMAP_LINEAR );
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER,
                          this.gl.NEAREST);
    this.gl.uniform1i(texLoc, idx);
  },
  sendGrid: function(image, idx, rows, cols) {
    var texture = this.gl.createTexture(),
        texLoc = this.gl.getUniformLocation(this.program, 'tex' + idx);

    this.gl.activeTexture(this.gl['TEXTURE' + idx]);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    if (rows) {
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, cols, rows,
                         0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
    } else {
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA,
                         this.gl.UNSIGNED_BYTE, image);
    }
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, 
                          this.gl.NEAREST_MIPMAP_LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER,
                          this.gl.NEAREST);
    this.gl.uniform1i(texLoc, idx);
  },
  render: function() {
    var rotationLoc = this.gl.getUniformLocation(this.program, "rotation"),
        textureSelectLoc = this.gl.getUniformLocation(
          this.program, "textureSelect");
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.uniformMatrix4fv(rotationLoc, false, flatten(this.rotation()));
    this.gl.uniform1i(textureSelectLoc, this.texture());
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.sphere.triangles.length);
  },
};

$(function() {
  App.init();
  App.rotation = function() {
    return mult(rotate($("#rotate_x").val(), 1, 0, 0),
           mult(rotate($("#rotate_y").val(), 0, 1, 0),
                rotate($("#rotate_z").val(), 0, 0, 1)));
  };
  App.texture = function() {
    return parseInt($('input[name=texture]:checked').val());
  };
  App.render();

  $('input').on("change", App.render.bind(App));
  $('input').on("input", App.render.bind(App));
});

