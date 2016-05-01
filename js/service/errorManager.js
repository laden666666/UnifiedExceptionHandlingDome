;(function(define,requirejs,window) {
	'use strict';

	define("errorManager",['$','$def'],function($,$def) {
		//errorFactory注册的异常
		var errorList = {};
		
		//对外暴漏的对象，负责注册异常的处理策略，调用已经注册的系统异常处理
		var errorManager = {
			/**
			 * 注册异常，将类放入error列表中，并让注册处理函数
			 * @param {Object} name			异常的名字
			 * @param {Object} handle		异常的处理函数
			 */
			registerError:function(name,handle){
				if(!$.isFunction(handle)){
					throw new Error("handle is not function");
				}
				
				//注册
				errorList[name] = {
					handle : handle
				}
			},
			
			/**
			 * 判断异常是否是指定异常类
			 * @param {Object} error			需要判断的异常对象
			 * @param {Object} errorName		异常的名字
			 */
			isError:function(error,errorName){
				return error && error._errorName == errorName;
			},
			
			/**
			 * 判断异常是否是指定异常类
			 * @param {Object} errorName		异常的名字
			 */
			findError:function(errorName){
				return errorList[errorName];
			},
			
			/**
			 * 处理错误，根据不同的异常类型，使用注册的异常方法处理去处理异常。这个就是在边界类上进行统一异常处理的方法
			 * @param {Object} error			需要处理的异常
			 * @param {Object} defaultHandle	当异常和所有注册的异常都不匹配的时候，做出的默认处理。这个参数可以是一个字符串，也可以是函数。如果是字符串就alert这个字符串，函数就执行这个函数
			 */
			handleErr : function(otherHandle,error){
				if(!error || !error._errorName || !this.findError(error._errorName)){
					//发现error是未注册异常时候调用的方法
					if($.isFunction(otherHandle)){
						otherHandle(error);
					} else {
						console.error(error);
						alert(otherHandle);
					}
				} else {
					error.printStack();
					//将错误源和系统默认的错误处理方法，都传递给注册的异常处理方法
					this.findError(error._errorName).handle(error,function(){
						if($.isFunction(otherHandle)){
							otherHandle(error);
						} else {
							console.log(otherHandle);
							alert(otherHandle);
						}
					});
				}
			},
			
			/**
			 * 访问所有已注册的异常的迭代器
			 */
			iterator:function(){
				var list = [];
				for(var k in errorList){
					list.push(errorList[k]);
				}
				var i = 0;
				return {
					hasNext : function(){
						return i < list.length;
					},
					next: function(){
						var nextItem = list[i];
						i++;
						return nextItem;
					},
					reset : function(){
						i = 0;
					}
				}
			},
		}

		return errorManager;
	});
	
	/**
	 * 异常的创建工程，同时提供注册新的异常类方法
	 */
	define("errorFactory",['errorManager'],function(errorManager) {
		
		var errorFactory = {};

		//系统异常超类
		errorFactory.BaseException = function (name,err) {
			//error是真正的错误，记录着调用的堆栈信息
			this.error = new Error(err);
			//异常的名字
			this._errorName = name;
		};
		errorFactory.BaseException.prototype = {
			printStack : function(){
				//对于ie8这种不支持console的浏览器兼容
				if(!window.console){
					window.console = (function(){  
					    var c = {}; c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile  
					    = c.clear = c.exception = c.trace = c.assert = function(){};  
					    return c;  
					})()
				}
				console.error(this.error.stack);
			},
		};
		
		/**
		 * 寄生组合继承实现，为了能实现堆栈信息的保留，使用这种特殊的js原型继承模式。
		 * 如果使用简单的prototype = new Error()的继承模式。Error的堆栈信息永远指向这个文件，
		 * 而不能把真正错误的语句的代码位置显示出来，故使用“寄生组合继承”这种继承方式
		 */
		function inheritPrototype(subType, superType) {
		    function F() {}
		    F.prototype = superType.prototype;
		    var prototype = new F();
		    prototype.constructor = subType;
		    subType.prototype = prototype;
		}
		
		//注册的几个系统异常
		/**
		 * 用户取消异常
		 * @param {Object} err			错误源
		 */
		function UserCancelException(err) {
			errorFactory.BaseException.call(this,"userCancel",err);
		}
		inheritPrototype(UserCancelException,errorFactory.BaseException);
		errorFactory.userCancel = function(err){
			throw new UserCancelException(err);
		}
		function UserCancelHandle(err) {
			//用户取消异常，什么也不做
		}
		errorManager.registerError("userCancel",UserCancelHandle);
		
		/**
		 * 初始化异常
		 * @param {Object} level		错误的级别
		 * @param {Object} err			错误源
		 */
		function InitException(level,err) {
			errorFactory.BaseException.call(this,"init",err);
			this.level = level;
		}
		inheritPrototype(InitException,errorFactory.BaseException);
		errorFactory.InitCancel = function(level,err){
			throw new InitException(level,err);
		}
		function InitHandle(err) {
			//根据不同的错误级别做出不同的处理
			switch (err.level){
				default:
					//根据不同的错误级别做出不同的处理策略，这里仅给出错误提示
					alert("应用初始化时发生错误！");
					break;
			}
		}
		errorManager.registerError("init",InitHandle);
		
		/**
		 * 网络异常
		 * @param {Object} err			错误源
		 */
		function HttpException(err) {
			errorFactory.BaseException.call(this,"http",err);
		}
		inheritPrototype(HttpException,errorFactory.BaseException);
		errorFactory.http = function(err){
			throw new HttpException(err);
		}
		function HttpHandle(err) {
			//提示链接不到服务器
			alert("无法访问到服务器！");
		}
		errorManager.registerError("http",HttpHandle);
		
		/**
		 * 服务器异常，如果服务器传来了服务器错误信息，就提示服务器错误信息，否则就执行默认的错误提示
		 * @param {String} serverMsg	服务器端发来的错误提示
		 * @param {Object} err			错误源
		 */
		function ServerException(serverMsg,err) {
			if(!err){
				err = serverMsg;
			} else {
				this.serverMsg = serverMsg;
			}
			errorFactory.BaseException.call(this,"server",err);
		}
		inheritPrototype(ServerException,errorFactory.BaseException);
		errorFactory.server = function(serverMsg,err){
			throw new ServerException(serverMsg,err);
		}
		function ServerHandle(err,defaultHandle) {
			//提示链接不到服务器
			if(err.serverMsg ){
				alert(err.serverMsg);
			} else {
				defaultHandle();
			}
		}
		errorManager.registerError("server",ServerHandle);
		
		return errorFactory;
	});
})(define,requirejs,window)
