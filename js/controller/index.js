requirejs(["$","$def","errorManager","errorFactory","avalon",'todoService'],function($,$def,eM,eF,avalon,todoService){
	
	//利用指令做css选择器，可以防止页面未初始化完的显示异常，用css将有ms-hd指令的节点隐藏，在指令中增加删除此指令的逻辑，这样渲染后就能看见这些节点了
	avalon.bindingHandlers.hd = function(data,vmodels){
	  	// 扩展的方法
	  	$(data.element).removeAttr("ms-hd");
	}
	avalon.bindingExecutors.hd = function(val, elem, data) {};
	
	//阻止avalon默认的启动逻辑，在domready里手动启动avalon.scan
	avalon.config({
        loader: false
    })
	$(function(){
		avalon.scan(document.body);
	})
				
	//创建avalon的controller和定义vm
	var todoController = avalon.define({
	    $id: "todo",
	    //todo的列表
	    todolist : [],
	    //删除todo
	    deleteTodo : function(todo){
	    	return $def.resolve()
			.then(function(){
				if(!confirm("确定要删除吗？")){
					//直接抛出用户取消异常，这样不用管后面逻辑如何，都会进入handleErr里。而用户取消异常的handleErr什么都不做
					eF.userCancel();
				}
			})
			.then(function(){
				return todoService.deleteTodo(todo.id);
			}).then(null,function(err){
				//调用统一异常处理，处理异常情况
				eM.handleErr("删除todo提交失败！",err);
			});
	    },
	    //完成todo
	    finishTodo : function(todo){
	    	return $def.resolve()
			.then(function(){
				return todoService.finishTodo(todo.id);
			}).then(null,function(err){
				//调用统一异常处理，处理异常情况
				eM.handleErr("完成todo提交失败！",err);
			});
	   },
	   //重做todo
	   redoTodo : function(todo){
	    	return $def.resolve()
			.then(function(){
				return todoService.redoTodo(todo.id);
			}).then(null,function(err){
				//调用统一异常处理，处理异常情况
				eM.handleErr("重做todo提交失败！（这个是默认的提示）",err);
			});
	   },
	});
	
	
	//刷新数据
	function listTodo(){
		//使用$def的resolve方法作为promise的发起者，主要是解决listTodo函数自身可能发生错误，而不能返回promise对象情况。
		//使用基于promise的异步调用链的设计模式，这样异步方法同样可以异常处理
		return $def.resolve()
		.then(function(){
			return todoService.listTodo();
		})
		.then(function(data){
			todoController.todolist = [];
			$(data).each(function(index,value){
				todoController.todolist.push(value);
			})
		})
		.then(null,function(err){
			//调用统一异常处理，处理异常情况
			eM.handleErr("加载todo列表失败",err);
		});
	}
	
	//第一次加载数据
	listTodo();
	
});