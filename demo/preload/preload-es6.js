'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Preload = (function () {
	function Preload(opts) {
		_classCallCheck(this, Preload);

		//可修改参数
		this.isDebug = opts.isDebug || false;
		this.sources = opts.sources || null;
		this.progress = opts.progress || function () {};
		this.connector = opts.connector || null;
		this.completeLoad = opts.completeLoad || function () {};
		this.timeOut = opts.loadingOverTime || 15;
		this.timeOutCB = opts.loadingOverTimeCB || function () {};

		//业务逻辑所需参数
		this.params = {
			echetotal: 0, //队列总数
			echelon: [], //队列资源列表
			echelonlen: [], //记录每个队列长度
			echeloncb: [], //队列回调标示

			id: 0, //自增ID
			flag: 0, //标示梯队

			allowType: ['jpg', 'jpeg', 'png', 'gif'], //允许加载的图片类型
			total: 0, //资源总数
			completedCount: 0, //已加载资源总数

			_createXHR: null, //Ajax初始化

			//img、audio标签预加载
			PNode: [],
			nodePSrc: [],

			//img标签
			imgNode: [],

			//audio标签
			audioNode: [],

			//异步调用接口数据
			head: document.getElementsByTagName("head")[0],

			//超时对象
			timer: []
		};

		if (this.sources == null) {
			this.throwIf('必须传入sources参数');
			return;
		}

		this._init();
	}

	_createClass(Preload, [{
		key: '_init',
		value: function _init() {
			var self = this,
			    params = self.params;
			// console.log("sources", this.sources);
			// console.log("progress", this.progress);
			// console.log("connector", this.connector);
			// console.log("completeLoad", this.completeLoad);
			// console.log("timeOut", this.timeOut);
			// console.log("timeOutCB", this.timeOutCB);
			// console.log("params", this.params);

			//初始化资源参数
			self._initData();

			//开始预加载资源
			self._load(params.echelon[0]);

			//调用接口数据
			if (self.connector !== null) {
				self._getData();
			}
		}
	}, {
		key: '_load',
		value: function _load(flagRes) {
			var flag = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

			var self = this,
			    params = self.params;

			// console.log(flagRes);

			/*
   *	返回队列内资源加载promise数组，异步
   *
   */
			var promise = flagRes.map(function (res) {

				if (self.isImg(res)) {
					params.timer[res] = setTimeout(function () {
						self.timeOutCB(res);
					}, self.timeOut * 1000);
					return self.preloadImage(res);
				} else {
					return self.preloadAudio(res);
				}
			});

			/*
   *	执行队列内资源加载promise数组，分成功和失败
   *
   */
			Promise.all(promise).then(function (success) {
				// console.log("图片加载成功");
				// console.log("success", success);
				// console.log("type", type);

				success.map(function (Svalue) {
					// console.log(Svalue);
					var index = params.nodePSrc.findIndex(function (value, index, arr) {
						return value == Svalue;
					});

					// console.log(index);
					if (index == -1) return;
					params.PNode[index].src = Svalue;
				});

				if (params.flag < params.echetotal - 1) {
					params.echeloncb[params.flag]();
					self._load(params.echelon[++params.flag]);
				} else {
					params.echeloncb[params.flag]();
					self.completeLoad();
				}
			}).catch(function (error) {
				// alert(1);
				var msg = error.path ? "资源加载失败，检查资源路径：" + error.path[0].src : error;
				self.throwIf(msg);
			});
		}

		/*
  *	初始化预加载所需数据
  *	echetotal									队列总数
  *	echelon										队列资源数组
  *	total										资源总数
  *	echelonlen									队列回调标记数组
  *	echeloncb									队列回调函数数组
  */

	}, {
		key: '_initData',
		value: function _initData() {
			var self = this,
			    params = self.params,
			    k = 0;
			params.echetotal = Object.getOwnPropertyNames(self.sources).length;

			//处理梯队资源和回调
			for (var i in self.sources) {
				params.echelon[k] = [];
				for (var j = 0, len = self.sources[i].source.length; j < len; j++) {
					++params.total;
					params.echelon[k].push(self.sources[i].source[j]);
				}
				//对于资源队列echelon进行去重
				params.echelon[k] = [].concat(_toConsumableArray(new Set(params.echelon[k])));

				// console.log(params.echelon[k]);

				params.echelonlen.push(params.echelon[k].length);

				params.echeloncb.push(typeof self.sources[i].callback == 'undefined' ? function () {} : self.sources[i].callback);

				k++;
			}

			//Ajax初始化
			// params._createXHR = self.getXHR();

			//梯队回调标示位置
			for (var i = 1, len = params.echelonlen.length; i < len; i++) {
				params.echelonlen[i] = params.echelonlen[i - 1] + params.echelonlen[i];
			}

			//处理img标签的预加载
			params.imgNode = document.getElementsByTagName('img'); //获取img标签节点
			for (var i = 0, len = params.imgNode.length; i < len; i++) {
				if (params.imgNode[i].attributes.pSrc) {
					params.nodePSrc.push(params.imgNode[i].attributes.pSrc.value);
					params.PNode.push(params.imgNode[i]);
				}
			}

			//处理audio标签的预加载
			params.audioNode = document.getElementsByTagName('audio'); //获取img标签节点
			for (var i = 0, len = params.audioNode.length; i < len; i++) {
				if (params.audioNode[i].attributes.pSrc) {
					params.nodePSrc.push(params.audioNode[i].attributes.pSrc.value);
					params.PNode.push(params.audioNode[i]);
					// params.audioNodePSrc[i] = params.audioNode[i].attributes.pSrc.value;
				}
			}

			// console.log("sources", self.sources);
			// console.log("params.echetotal", params.echetotal);
			// console.log("params.echelon", params.echelon);
			// console.log("params.echelonlen", params.echelonlen);
			// console.log("params.echeloncb", params.echeloncb);
			// console.log("params._createXHR", params._createXHR);
			// console.log("params.total", params.total);
			// console.log("params.PNode", params.PNode);
			// console.log("params.nodePSrc", params.nodePSrc);
			// console.log("params.flag", params.flag);
			// console.log("self.completeLoad", self.completeLoad);
			// console.log("self.progress", self.progress);
			// console.log("params.id", params.id);
		}

		//返回超时Promise对象
		// timeOutPromise(time) {
		// 	return new Promise((resolve, reject) => {
		// 		setTimeout(resolve, time);
		// 	});
		// }

	}, {
		key: '_getData',
		value: function _getData() {

			var self = this,
			    params = self.params;

			for (var i in self.connector) {
				if (self.connector[i].jsonp) {
					self.asynGetData(self.connector[i].url);
				} else {
					self.syncGetData(self.connector[i].url, self.connector[i].callback);
				}
			}
		}

		/*
  *	同步获取后台数据
  *	
  *	@param	url			接口路径 
  *	@param	callback	成功后回调 
  *
  */

	}, {
		key: 'syncGetData',
		value: function syncGetData(url, callback) {
			var self = this,
			    params = self.params;

			params._createXHR = new XMLHttpRequest();
			// config.xhr = _createXHR;
			params._createXHR.onreadystatechange = function () {
				if (params._createXHR.readyState == 4) {
					if (params._createXHR.status >= 200 && params._createXHR.status < 300 || params._createXHR.status === 304) {
						callback(params._createXHR.responseText);
					}
				}
			};

			params._createXHR.open("GET", url, true);

			params._createXHR.send(null);
		}

		/*
  *	跨域获取后台数据
  *	
  *	@param	url	接口路径 
  *
  */

	}, {
		key: 'asynGetData',
		value: function asynGetData(url) {
			var self = this,
			    params = self.params;
			var script = document.createElement("script");
			script.src = url;
			params.head.appendChild(script);
		}

		//返回加载图片资源premise对象

	}, {
		key: 'preloadImage',
		value: function preloadImage(url) {
			var self = this,
			    params = self.params;
			return new Promise(function (resolve, reject) {
				var image = new Image();
				image.onload = function () {
					// alert(1);

					self.progress(++params.id, params.total);

					//清除计时器
					clearTimeout(params.timer[url]);

					// console.log(11111);
					resolve(url);
				};
				image.onerror = reject;
				image.src = url;
			});
		}

		//返回加载音频资源premise对象

	}, {
		key: 'preloadAudio',
		value: function preloadAudio(url) {
			var self = this,
			    params = self.params;

			// console.log("params", params);

			return new Promise(function (resolve, reject) {
				params._createXHR = new XMLHttpRequest();
				params._createXHR.open("GET", url);
				params._createXHR.onreadystatechange = handler;
				params._createXHR.send();

				function handler() {
					if (this.readyState !== 4) {
						return;
					}
					if (this.status === 200) {
						self.progress(++params.id, params.total);
						resolve(url);
					} else {
						// console.log(this.statusText);
						reject(url);
					}
				}
			});
		}

		//错误数据弹出

	}, {
		key: 'throwIf',
		value: function throwIf() {
			var msg = arguments.length <= 0 || arguments[0] === undefined ? '未知错误' : arguments[0];

			if (this.isDebug) {
				alert(msg);
				return;
			}
		}

		//判断是否是图片

	}, {
		key: 'isImg',
		value: function isImg(res) {
			var self = this,
			    params = self.params,
			    type = res.split('.').pop();

			for (var i = 0, len = params.allowType.length; i < len; i++) {
				if (type == params.allowType[i]) return true;
			}
			return false;
		}

		//获取XHR，已废弃

	}, {
		key: 'getXHR',
		value: function getXHR() {
			if (typeof XMLHttpRequest != "undefined") {
				return new XMLHttpRequest();
			} else if (typeof ActiveXObject != "undefined") {
				if (typeof arguments.callee.activeXString != "string") {
					var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp"],
					    i,
					    len;
					for (var _i = 0, _len = versions.length; _i < _len; _i++) {
						try {
							new ActiveXObject(versions[_i]);
							arguments.callee.activeXString = versions[_i];
							break;
						} catch (ex) {
							//跳过
						}
					}
				}
				return new ActiveXObject(arguments.callee.activeXString);
			} else {
				throw new Error("No XHR object available.");
			}
		}
	}]);

	return Preload;
})();

// export default Preload;