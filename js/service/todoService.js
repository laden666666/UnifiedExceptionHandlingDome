;(function(define,requirejs,window) {
	'use strict';

	define("todoService",['$','errorFactory','$ajax','config'],function($,eF,$ajax,config) {
		return {
			//加载todo的方法，这个是正常的请求
			listTodo : function(){
				return $ajax({
					url: config.restUrl + "data/listTodo.json",
					type: 'get',
					cache: false,
					dataType:"json"
				})
			},
			//完成todo的方法，这里模拟服务器端异常
			finishTodo : function(id){
				//这里需要模拟服务器端异常，注释掉原有逻辑
//				return $ajax({
//					url: config.restUrl + "data/finishTodo.json",
//					type: 'get',
//					cache: false,
//					dataType:"json",
//				})
				
				//模拟服务器端错误。前台会提示服务器端提示的msg，而不是默认的提示信息
				var err = {
					status : 500,
					responseText : "{\"msg\":\"服务器出现错误，提交失败！\"}"
				}
				throw eF.server(JSON.parse(err.responseText).msg ,err);
			},
			//重做todo，用于把已经完成的todo变为未完成状态，这里我们用来模拟非系统异常的处理方式
			redoTodo : function(id){
				//这里需要模拟非系统异常的处理方式，注释掉原有逻辑
//				return $ajax({
//					url: config.restUrl + "data/redoTodo.json",
//					type: 'get',
//					cache: false,
//					dataType:"json",
//				})

				//直接抛出错误
				throw new Error();
			},
			//保存todo的方法，这里模拟网络异常
			deleteTodo : function(id){
				//请求一个并不存在的地址
				return $ajax({
					url: "http://11111111111111111111111.com/data/saveTodo.json",
					type: 'get',
					cache: false,
					dataType:"json"
				});
			},
		}
	});
})(define,requirejs,window)
