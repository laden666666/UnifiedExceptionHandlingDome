;(function(define,requirejs,setTimeout) {
	'use strict';
		
	/**
	 * $def是对$.Deferred的一些封装，用于简化我的的异步调用过程。同时promise的具体实现往往是参考promise/A+规范的，所以可以把此规范看做是一个门面模式
	 * 而$def可以看成是一个将具体实现封装起来的适配器接口，可以让不同对promise/A+规范实现的类库都能被使用。因此用$def开发的的代码将来即使使用其他类库的
	 * promise实现代替$.Deferred的实现，这些代码也可以很好的移植。所以$def产生的promise对象，建议仅使用resolve、reject和notify这几个方法，因为
	 * 这些方法是标准promise提供的，更加利于代码移植。
	 */
	define("$def",['$'],function($) {
		window.$def = {
			/**
			 * 快速resolve
			 * @param {Object} o		返回的参数
			 */
			resolve: function(o){
				var d = $.Deferred();
				d.resolve(o);
				return d.promise();
			},
			/**
			 * 快速reject
			 * @param {Object} o		抛出的异常
			 */
			reject: function(o){
				var d = $.Deferred();
				d.reject(o);
				return d.promise();
			},
			/**
			 * 对Promise/A+中的racte的实现
			 * @param {arguments}		一个Promise的数组
			 */
			racte : function(){
				var self = this;
				var d = $.Deferred();
				
				$.each(arguments,function(i,e){
					self.resolve()
					.then(function(){
						return e;
					})
					.then(function(){
						d.resolve.apply(d,arguments);
					},function(err){
						d.reject(err);
					})
				});
				return d.promise();
			},
			/**
			 * 对Promise/A+中的all的实现
			 * @param {arguments}		一个Promise的数组
			 */
			all : function(){
				var list = [];
				for(var index in arguments){
					list.push(this.resolve(arguments[index]));
				}
				return $.when.apply($,list);
			},
			/**
			 * 对ES6的Promise的实现
			 * @param {Function} fn		和标准的Promise的回调入参一样，是两个函数，分别是resolve和reject
			 */
			Promise : function(fn){
				var d = $.Deferred();
				
				function resolve(v){
					d.resolve(v);
				}
				
				function reject(v){
					d.reject(v);
				}
				
				if($.isFunction(fn)){
					fn(resolve,reject)
				}
				return d.promise();
			}
		}
		return window.$def;
	});
	
	/**
	 * 基于jq负责发送ajax的方法
	 */
	define("$ajax",['$','errorFactory'],function($,eF) {
		return function(option){
			return $.ajax(option).promise()
			//将失败的ajax调用封装成
			.then(null,function(err){
				//如果是status为0，表示超时取消或者ajax终止，提交http请求异常。如果状态为502是网关错误，表示当前网路还是连接不上服务器
				if(err.status == 0 || err.status == 502){
					throw eF.http(err);
				} else{
					//否则，需要根据服务器端做好接口，通过responseText判断出是服务器端异常，把服务器端传递来的消息提示出去
					//这里只是示意的代码，需要根据服务器端具体情况具体处理
					if(err.responseText.indexOf("{\"msg\":") == 0){
						throw eF.server(JSON.parse(err.responseText).msg ,err);
					}
					//以上情况都不符合，直接把原始异常向上抛出
					throw err;
				}
			});
		}
	});
})(define,requirejs,setTimeout)
