"use strict";

//include pixi
var pixi = require('pixi.js');
var timer = require('pixi-timer');//adds timer class to pixi

//include framwork
var tapir = require('./../../src/');

//gameManager is the main class of the game
var gameManager = exports;
gameManager.loadCounter = 0;
gameManager.totalAssetsToLoad = 159;

//managers are assigned to the game Manager to be reachable from dynamic code
gameManager.objectManager = tapir.objectManagement.objectManager;
gameManager.sceneManager = tapir.sceneManagement.sceneManager;
gameManager.dataManager = tapir.loader.dataManager;
gameManager.assetManager = tapir.loader.assetManager;
gameManager.server = require('./scripts/slot/serverSim/serverSim.js');
gameManager.reelLines = require('./scripts/slot/reels/reelLines.js');
gameManager.spinning = false;
gameManager.activeSlotLine = 9;

gameManager.animType = tapir.objectManagement.objectTypes.animation;

var scene = tapir.sceneManagement.scene;
var dynamicTypes = tapir.objectManagement.objectTypes.dynamicTypes;

//custom object type declarations
var slotType = require('./scripts/types/slotType.js');

//path of the JSON file containing game data to initialize the game
var gameDataPath = ('games/test/data/game.json');

//setting up renderer and stage
var renderer = pixi.autoDetectRenderer(1280, 800,{transparent: true});
gameManager.stage = new pixi.Container();

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

function loadGameData(){
  console.log("started loading game data!");
  //loads all game data. callback function load assets is called after all data is loaded.
  gameManager.dataManager.loadAllGameData(gameDataPath, initLoader);
  //gameManager.dataManager.loadData(gameDataPath, loadAssets, "myGameData");
}
function initLoader(){
  gameManager.assetManager.loadImageBatch(gameManager.dataManager.getAssetDataByName("loaderAssets"), showLoadingScreen);

  function showLoadingScreen(){
    gameManager.loaderSc = new scene(gameManager.dataManager.getSceneDataByName("loaderScene"));

    gameManager.stage.addChild(gameManager.loaderSc.container);

    gameManager.updateLoadScreenCount = function(p){
        //gameManager.loadCounter++;
        var loaderTxt = gameManager.objectManager.getObjectByName("loaderText");
        loaderTxt.displayObject.content("LOADING GAME %" + Math.floor(p/*gameManager.loadCounter * 100 / gameManager.totalAssetsToLoad)*/));
        //console.log("loading %" + Math.trunc(gameManager.loadCounter * 100 / gameManager.totalAssetsToLoad));
      }

    gameManager.assetManager.loaderScreenFunction = gameManager.updateLoadScreenCount;
    gameManager.assetManager.loader.progress = 0;
    loadAssets();
  }
}

//loadAssets

function loadAssets(){


  var count = 0;
  //registering a dynamic object type
  dynamicTypes.registerDynamicObjectType(new slotType());

  //gameManager.assetManager.loadImageBatch(gameManager.dataManager.getAssetDataByName("symbolTextures"), assetsLoaded);

  console.log("started loading assets ");

  //load assets. callback function assetsLoaded is called after all assets are loaded.
  gameManager.assetManager.loadImageBatch(gameManager.dataManager.getAssetDataByName("symbolTextures"), assetsLoaded);
  gameManager.assetManager.loadImageBatch(gameManager.dataManager.getAssetDataByName("uiAssets"), assetsLoaded);
  gameManager.assetManager.loadAnimBatch(gameManager.dataManager.getAssetDataByName("animAssets"), assetsLoaded);



  function assetsLoaded(to, loaded){
    count++;
    //checks if all of the asset batches are loaded
    if(count == 3){
      console.log("all assets are loaded! ");

      gameManager.loaderSc.hide();
      //console.log("asdas: " + gameManager.loaderSc.displayObject.visible)
      //create scene
      var sc = new scene(gameManager.dataManager.getSceneDataByName("slotScene"));

      //add scene to the stage
      gameManager.stage.addChild(sc.container);

      //set initial number of lines to play
      gameManager.slot.setActiveLineButton(gameManager.activeSlotLine);

      //make line button container reachable through the root script
      gameManager.lineBtnCont = gameManager.objectManager.getObjectByName("lineButtonContainer").displayObject;

      gameManager.slot.updateCashText();
      gameManager.objectManager.getObjectByName("coinValueText").displayObject.content(gameManager.server.coinValue);
      gameManager.objectManager.getObjectByName("lineNumberText").displayObject.content(gameManager.server.selectedLines);
      gameManager.objectManager.getObjectByName("spinValueText").displayObject.content(gameManager.server.spinValue);;
      gameManager.objectManager.getObjectByName("winText").displayObject.content("WELCOME!");
      console.log("window.innerHeight: " + window.innerHeight + " windowInnerWidth: " + window.innerWidth);

      requestAnimationFrame(update);
    }
  }

}


function update(){
  requestAnimationFrame(update);
  renderer.render(gameManager.stage);
    pixi.timerManager.update();
  for(var i = 0; i < 5; i++){
    if(gameManager.slot != undefined && gameManager.slot.reelArr[i]!=undefined){
      renderer.render(gameManager.slot.reelArr[i].cont, gameManager.slot.reelArr[i].rendText);
      if(gameManager.slot.reelArr[i].isSpinning){
          gameManager.slot.reelArr[i].spinReel(20);
      }
    }
  }

    /**********place the game on the center of the screen**********/
    renderer.view.style.position = 'absolute';
    renderer.view.style.left = '50%';
    renderer.view.style.top = '50%';
    renderer.view.style.transform = 'translate3d( -50%, -50%, 0 )';
    /**************************************************************/
}

function resize() {
    if (window.innerWidth / window.innerHeight >= gameManager.screenRatio) {
        var w = window.innerHeight * gameManager.screenRatio;
        var h = window.innerHeight;
    } else {
        var w = window.innerWidth;
        var h = window.innerWidth / gameManager.screenRatio;
    }
    renderer.view.style.width = w + 'px';
    renderer.view.style.height = h + 'px';
    renderer.drawingArea.width = w;
    renderer.drawingArea.height = h;
}
