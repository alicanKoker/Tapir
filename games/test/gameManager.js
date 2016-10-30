"use strict";

//include pixi
var pixi = require('pixi.js');

//include framwork
var tapir = require('./../../src/');

//gameManager is the main class of the game
var gameManager = exports;

//managers are assigned to the game Manager to be reachable from dynamic code
gameManager.objectManager = tapir.objectManagement.objectManager;
gameManager.sceneManager = tapir.sceneManagement.sceneManager;
gameManager.dataManager = tapir.loader.dataManager;
gameManager.assetManager = tapir.loader.assetManager;
gameManager.reelLines = require('./scripts/reels/reelLines.js');
gameManager.spinning = false;

var scene = tapir.sceneManagement.scene;
var dynamicTypes = tapir.objectManagement.objectTypes.dynamicTypes;

//a custom object type declaration example
var spriteType = require('./scripts/types/spriteType.js');

//path of the JSON file containing game data to initialize the game
var gameDataPath = ('games/test/data/game.json');

//setting up renderer and stage
var renderer = pixi.autoDetectRenderer(1280, 800,{transparent: true});
var stage = new pixi.Container();

var gameDiv = document.getElementById('gameDiv');
gameDiv.appendChild(renderer.view);

//add gameManager to the window so that the dynamic code can reach namespace
window.gameManager = gameManager;

//function to initialize the game
gameManager.initGame = function(gameDataFilePath){
  //load json files and keep data inside dataManager.
  loadGameData();

  //start updating stage
  update();
}

gameManager.startSpin = function(){
  var text = gameManager.objectManager.getObjectByName("spinText");
  if(gameManager.spinning){
    gameManager.spinning = false;
    text.displayObject.content("SPIN");
  }
  else{
    gameManager.spinning = true;
    text.displayObject.content("STOP");
  }
}

gameManager.drawLine = function(v){
  var lineBtnCont = gameManager.objectManager.getObjectByName("lineButtonContainer");
  lineBtnCont.displayObject.children.forEach(elm =>{
    if(elm.name == ("btnLine" + v)){
      elm.setState("selected");
      elm.clicked = true;
    }
    else{
      elm.setState("init");
      elm.clicked = false;
    }
  });

  var lnCont = gameManager.objectManager.getObjectByName("lineContainer");
  if(lnCont.displayObject.children != null)
    lnCont.displayObject.removeChildren();
  lnCont.displayObject.addChild(gameManager.reelLines.drawLine(v));
}

function loadGameData(){
  console.log("started loading game data!");
  //loads all game data. callback function load assets is called after all data is loaded.
  gameManager.dataManager.loadAllGameData(gameDataPath, loadAssets);
}

function loadAssets(){
  console.log("started loading assets!");

  //load assets. callback function assetsLoaded is called after all assets are loaded.
  gameManager.assetManager.registerAllAssets(gameManager.dataManager.assetData, assetsLoaded);

  //example of registering a dynamic object type
  dynamicTypes.registerDynamicObjectType(new spriteType());
}

function assetsLoaded(){
  console.log("all assets are loaded!");
  //create scenes
  var s = new scene(gameManager.dataManager.getSceneByName("slotScene")).container;
  stage.addChild(s);

}

function update(){
  requestAnimationFrame(update);
  renderer.render(stage);
}
