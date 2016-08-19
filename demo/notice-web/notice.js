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

	const Notice = __webpack_require__(1);

	const notice = new Notice({
		isDebug: true,
		denied: function () {
			//选填，用户拒绝之后执行回调
			alert("denied!!!");
		}
	});

	const fun = function () {
		window.location.href = "https://github.com/jayZOU/notice-web";
	};

	document.getElementById("btn").addEventListener("click", function (e) {
		notice.show({
			title: "通知标题---" + Math.random(),
			body: "通知主体---" + new Date(),
			icon: "http://img1.gtimg.com/2016/pics/hv1/44/137/2111/137302754.png"
		}, fun);
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	class Notice {
	    constructor(opts) {
	        let _self = this;
	        this.isDebug = opts.isDebug || false;
	        this.denied = opts.denied || function () {};
	        this.notification = {};
	        if (!("Notification" in window) && this.isDebug) {
	            this.throwIf('This browser does not support desktop notification');
	        }

	        if (window.Notification.permission == "denied") {
	            // console.log(1111);
	            this.denied();
	            return;
	        } else if (window.Notification.permission == "default") {
	            Notification.requestPermission(function (permission) {
	                if (permission == "denied") {
	                    _self.denied();
	                }
	            });
	        }
	    }
	    show(msg, fun) {
	        if (window.Notification.permission === "granted") {
	            // this.denied();
	            this.notification = new Notification(msg.title, {
	                body: msg.body,
	                icon: msg.icon
	            });
	            this.notification.onclick = function () {
	                fun();
	                this.close();
	            };
	        }
	    }
	    //错误数据弹出
	    throwIf(msg = '未知错误') {
	        if (this.isDebug) {
	            alert(msg);
	            return;
	        }
	    }
	}

	module.exports = Notice;

/***/ }
/******/ ]);