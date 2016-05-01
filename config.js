requirejs.config({
	//baseUrl: "/",
	baseUrl: "/UnifiedExceptionHandlingDome/",
	enforceDefine:true,
	paths: {
        
		//vue相关
        'avalon': 'lib/avalon/avalon.min',
        
        //jquery
        '$': 'lib/jquery/jquery-compat-3.0.0-alpha1',
        
        //domReady
        'domReady': 'lib/require/domReady',
        
        //promise工具类，是对$.Deferred的一个封装
        '$def': 'js/service/util',
        
        //ajax.js
        '$ajax': 'js/service/util',
        
        //实现统一异常处理逻辑的方法
        'errorManager': 'js/service/errorManager',
        
        //实现统一异常处理逻辑的方法
        'errorFactory': 'js/service/errorManager',
        
        //todo的service
        'todoService': 'js/service/todoService',
        
    },
	
    shim: {
        'avalon': {
            exports: 'avalon'
        },
        '$': {
            exports: '$'
        },
    },
    
});

define("config",[],function() {
    return {
    	restUrl: "/UnifiedExceptionHandlingDome/",
    }
});
