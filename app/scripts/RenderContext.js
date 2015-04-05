"use strict";

var RenderContext = function(canvas) {

  // PRIVATE VARS

  var _this = this;

  var _canvas = canvas;
  var _renderer, _scene, _camera;
  var _w, _h, _aspect;

  var _lastTime = Date.now();
  var _meshes, _geo, _matLine, _matFill;


  // HARDCODE PARAMS

  var _cameraParams = {
    fov: 45,
    near: 1,
    far: 1000
  };


  // PRIVATE FUNCTIONS

  var _initRenderer = function() {
    _renderer = new THREE.WebGLRenderer({
      canvas: _canvas,
      alpha: false,
      depth: true,
      stencil: false,
      antialias: false,
    });
    _renderer.setSize(_w, _h);
    _renderer.setClearColor(0x0);
    _renderer.autoClear = false;
  };

  var _init = function() {
    _w = _canvas.clientWidth;
    _h = _canvas.clientHeight;
    _aspect = _w/_h;

    _initRenderer();

    _camera = new THREE.PerspectiveCamera(
      _cameraParams.fov,
      _aspect,
      _cameraParams.near,
      _cameraParams.far
    );

    _scene = new THREE.Scene();

    window.addEventListener("resize", _onResize, false);

    _this.customInit();
  };

  var _onResize = function() {
    _w = _canvas.parentNode.clientWidth;
    _h = _canvas.parentNode.clientHeight;
    _aspect = _w/_h;

    _renderer.setSize(_w, _h);

    _camera.aspect = _aspect;
    _camera.updateProjectionMatrix();
  };

  var _calcDeltaTime = function() {
    var currTime = Date.now();
    var dt = 0.001 * ( currTime - _lastTime );
    _lastTime = currTime;
    return dt;
  };


  // PUBLIC FUNCTIONS

  this.update = function() {
    _renderer.clearTarget(null);

    var dt = _calcDeltaTime();
    this.customUpdate(dt);

    _renderer.render(_scene, _camera);
  };

  this.getRenderer = function() {
    return _renderer;
  };

  this.getScene = function() {
    return _scene;
  };

  this.getCamera = function() {
    return _camera;
  };

  this.setColors = function(color, bgcolor) {
    _matLine.color.set(color);
    _matFill.color.set(bgcolor);
    _renderer.setClearColor(bgcolor);
  };

  this.customInit = function() {
    _camera.position.z = 10;

    // init common geo and mats
    _geo = new THREE.IcosahedronGeometry(1);
    _matLine = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true
    });
    _matFill = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: 1.0
    });

    // init meshes
    var MESH_COUNT = 10;
    _meshes = [];
    for (var i=0; i<MESH_COUNT; i++) {
      var meshLine = new THREE.Mesh(_geo, _matLine);
      var meshFill = new THREE.Mesh(_geo, _matFill);

      var POS_RANGE = new THREE.Vector3(5, 15, 20);
      var randPos = new THREE.Vector3(
        POS_RANGE.x*Math.random()-POS_RANGE.x/2,
        POS_RANGE.y*Math.random()-POS_RANGE.y/2,
        POS_RANGE.z*Math.random()-POS_RANGE.z/2);
      meshLine.position.copy(randPos);
      meshFill.position.copy(randPos);

      var ROT_RANGE = 1.0;
      var randRot = [ ROT_RANGE*Math.random()-ROT_RANGE/2.0,
                      ROT_RANGE*Math.random()-ROT_RANGE/2.0,
                      ROT_RANGE*Math.random()-ROT_RANGE/2.0];
      meshLine.rotSpeed = meshFill.rotSpeed = randRot;

      _meshes.push(meshLine);
      _meshes.push(meshFill);
      _scene.add(meshLine);
      _scene.add(meshFill);
    }
  };

  this.customUpdate = function(dt) {
    for (var i=0; i<_meshes.length; i++) {
      _meshes[i].rotation.x += _meshes[i].rotSpeed[0] * dt;
      _meshes[i].rotation.y += _meshes[i].rotSpeed[1] * dt;
      _meshes[i].rotation.z += _meshes[i].rotSpeed[2] * dt;
    }

    var RANGE = 20;
    var totalHeight = document.documentElement.scrollHeight;
    var currHeight = window.pageYOffset + window.innerHeight/2;
    _camera.position.y = -currHeight/totalHeight * RANGE + RANGE/2.0;
  };


  _init();

};

RenderContext.prototype.constructor = RenderContext;