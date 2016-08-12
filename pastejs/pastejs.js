/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const Pastejs = __webpack_require__(1);

	// console.log(pastejs);

	const pastejs = new Pastejs({
		isDebug: true,
		target: box,
		callBack: function (paste) {
			console.log(paste);
			document.getElementById("img").src = paste['source'];
			document.getElementById("text").innerHTML = "size:" + paste['blob'].size + "<br>type:" + paste['blob'].type;
		}
	});

	// console.log(Pastejs._init);

/***/ },
/* 1 */
/***/ function(module, exports) {

	class Pastejs {
		constructor(opts) {
			this.isDebug = opts.isDebug || false;
			this.target = opts.target || null;
			this.callBack = opts.callBack || function () {};

			this._init();
		}
		_init() {
			let self = this,
			    target = self.target;
			if (!target) this.throwIf('必须传入note参数');

			self._bindEvent();
		}
		_bindEvent() {
			let self = this,
			    target = self.target;
			target.addEventListener("paste", function (e) {
				if (!(e.clipboardData && e.clipboardData.items && e.clipboardData.items[0])) {
					this.throwIf('不支持剪切板事件');
					return;
				}
				let items = e.clipboardData.items,
				    paste = [];
				if (items) {
					for (var i = 0; i < items.length; i++) {
						if (items[i].type.indexOf("image") !== -1) {
							let blob = items[i].getAsFile();
							let URLObj = window.URL || window.webkitURL || window.createObjectURL;
							let source = URLObj.createObjectURL(blob);
							paste['blob'] = blob;
							paste['source'] = source;
							self.callBack(paste);
						}
					}
				}
			});
		}
		//错误数据弹出
		throwIf(msg = '未知错误') {
			if (this.isDebug) {
				alert(msg);
				return;
			}
		}
	}

	module.exports = Pastejs;

/***/ }
/******/ ]);