//ES6 全局变量使用const关键字定义：  只读
const northImg = new Image();
northImg.src = "static/img/north.png";
const southImg = new Image();
southImg.src = "static/img/south.png";
const eastImg = new Image();
eastImg.src = "static/img/east.png";
const westImg = new Image();
westImg.src = "static/img/west.png";
const bodyImg = new Image();
bodyImg.src = "static/img/body.png";
const foodImg = new Image();
foodImg.src = "static/img/food.png";
var bgImg = new Image();
bgImg.src = "static/img/background.png";
//将欢迎界面的图片放在最后，表示加载成功后，其他图片已经加载完毕，无需再进行onload判断
const startImg = new Image();
startImg.src = "static/img/start.png";

const diamondImg=new Image();
diamondImg.src="static/img/diamond.png";

const appleImg=new Image();
appleImg.src="static/img/Apple.png";

$("#bgpic>img").click(function(){
	bgImg.src=this.src;
//	console.log(this.src);
})

function Snake() {

	this.canvas = $("#gameview")[0]; //canvas画布对象
	this.ctx = this.canvas.getContext("2d"); //画笔
	this.width = 500; //背景（游戏屏幕）的宽度
	this.height = 500; //背景（游戏屏幕）的高度
	this.step = 25; //设计步长
	this.stepX = Math.floor(this.width / this.step); //X轴步数
	this.stepY = Math.floor(this.height / this.step); //Y轴步数
	this.snakeBodyList = []; //设置蛇身数组
	this.foodList = []; //设置食物数组
	this.timer = null;//蛇动时的定时器soc
	this.score = 0;//分数  +10  存入到localStorage中
	this.isDead = false;//蛇是否活着标识位
	this.isEaten = false;//食物是否被吃掉标识位
	this.isPhone = false;//判断设备是否为移动端  true--移动端  false--PC
	this.time=400;
	//响应式页面 新加数组随机获得不同食物
	this.foodType=[
				{
					img:foodImg,
					score:10
				},
				{
					img:diamondImg,
					score:20
				},
				{
					img:appleImg,
					score:30
				}
	
	];
	
	/*
	 * 拖动range按钮，获得不同的值（0-1）乘上1000之后，赋值给定时器事件中的事件变量
	 */
	var _this=this;
	$("#range").change(function(event){
					
					event=event||window.event;
					var sudu=document.getElementById("range").value;
					//console.log(sudu);
					this.time=sudu*1000;
					console.log(this.time);
					clearInterval(_this.timer);
					_this.timer = setInterval(addMove,this.time);
				});
				

			
	/*
	 * 1-生成初始化页面，点击该页面，进入游戏
	 */
	this.init = function() {
		this.device();//判断设备类型
		this.ctx.drawImage(startImg, 0, 0, this.width, this.height);
	}
	/*
	 * 2-游戏开始，绘制背景、蛇、食物,蛇移动
	 */
	
	this.start = function(){
		this.device();//判断设备类型
		this.score = 0;//积分清零
		this.paint();
		this.move();
	}
	
	/*
	 * 判断当前设备是否是移动端
	 */
	this.device = function(){
		//1-读取BOM对象navigator的userAgent信息
		var deviceInfo = navigator.userAgent;
		//2-判断是否为PC端（是否含有Windows字符串）
		if(deviceInfo.indexOf("Windows") == -1){
			this.isPhone = true;
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
			this.width = window.innerWidth;
			this.height = window.innerHeight;
			this.stepX = this.width/this.step;
			this.stepY = this.height/this.step;
			console.log(this.width+":"+this.height);
		}
		
	}
	
	/*
	 * 绘制背景、蛇、食物
	 */
	this.paint = function() {
		//2.1 画出背景
		this.ctx.drawImage(bgImg, 0, 0, this.width, this.height);
		//2.2 画蛇
		this.drawSnake();
		//2.3 随机画出食物
		this.drawFood();
	}
	/*
	 * 2.2画蛇：算法[{x:横坐标，y：纵坐标，img：图片，direct：运动方向},.......]
	 */
	this.drawSnake = function() {
		//2.2.1循环生成snakeBodyList数组中的对象集合 （默认，蛇居于中间，蛇头向西）
		if(this.snakeBodyList.length<5){
		for(var i = 0; i < 5; i++) {
			//{x:横坐标，y：纵坐标，img：图片，direct：运动方向}蛇的节点设计
			this.snakeBodyList.push({
				x: Math.floor(this.stepX / 2) + i - 2, //注意：x不是px像素坐标点，而是x轴步数
				y: Math.floor(this.stepY / 2), //注意：这是y轴步数
				img: bodyImg,
				direct: "west"
			});
		}
		//2.2.2替换snakeBodyList数组第一个元素的img，替换成westImg蛇头图片
		this.snakeBodyList[0].img = westImg;
		}
		//2.2.3遍历snakeBodyList数组，并画出蛇的初始状态
		for(var i = 0; i < this.snakeBodyList.length; i++) {
			var snode = this.snakeBodyList[i];
			this.ctx.drawImage(snode.img, snode.x * this.step,
				snode.y * this.step, this.step, this.step);
		}
		

	}
	/*
	 * 2.3画食物
	 */
	this.drawFood = function() {
		var _this=this;
		//2.3.1当食物已经存在的时候，画面刷新时，食物在原有位置重绘
		if(this.foodList.length > 0) {
			var fnode = this.foodList[0];
			this.ctx.drawImage(fnode.img, fnode.x * this.step, fnode.y * this.step, this.step, this.step);
			return;
		}
		//2.3.2如果食物没有（食物被吃或游戏初始化），生成x，y随机坐标，判断是否与蛇身重复
		//如果重复，重绘，调用this.drawfood(),否则，按照随机生成的点push到数组中，绘制图案
		var foodX = Math.floor(Math.random() * this.stepX);
		var foodY = Math.floor(Math.random() * this.stepY);
		var foodFlag = false; //判断食物与蛇身是否重复的标识位，true重复，false 不重复
		for(var i = 0; i < this.snakeBodyList.length; i++) {
			var snode1 = this.snakeBodyList[i];
			if(foodX == snode1.x && foodY == snode1.y) {
				foodFlag = true;
			}
		}
		
		
		var foodLizi=addFood();//接受addFood 的返回对象
		var foodTypeImg=foodLizi.img;//返回对象的图
		var foodScore=foodLizi.score;//....你懂得
		console.log(foodScore);
		if(foodFlag) {
			this.drawFood(); //如果重复，则重绘
		} else {
			this.foodList.push({
				x: foodX,
				y: foodY,
				img: foodTypeImg,
				score:foodScore
			}); //新生成一个食物
			var fnode = this.foodList[0];
			this.ctx.drawImage(fnode.img, fnode.x * this.step, fnode.y * this.step, this.step, this.step);
		}
		
		//随机获得foodType数组的元素
		function addFood(){
			var m=Math.floor(Math.random()*3);//生成随机数
			return _this.foodType[m];//返回变量m值，
		}

	}
	/*
	 * 3-蛇动（事件改变蛇移动方向，判断蛇是否死掉，然后判断蛇是否吃了食物，之后蛇移动）
	 * 3.1 判断设备如果是pc，响应键盘事件，否则，响应触屏事件
	 * 3.2 生成键盘事件处理器this.keyHandler()，和触屏事件处理器this.touchHandler()
	 */
	this.keyHandler = function(){//键盘事件处理器
			//事件处理是异步的，所以，无法传递this对象
		var _this = this;
		document.onkeydown = function(ev){
			var ev = ev||window.event;
//			console.log(ev.key+":"+ev.keyCode);
//			console.log(_this.snakeBodyList);
			switch(ev.keyCode){
				case 37://向左
					_this.snakeBodyList[0].img = westImg;
					_this.snakeBodyList[0].direct = 'west';
				break;
				case 38://向上
					_this.snakeBodyList[0].img = northImg;
					_this.snakeBodyList[0].direct = 'north';
				break;
				case 39://向右
					_this.snakeBodyList[0].img = eastImg;
					_this.snakeBodyList[0].direct = 'east';
				break;
				case 40://向下
					_this.snakeBodyList[0].img = southImg;
					_this.snakeBodyList[0].direct = 'south';
				break;
			}
		}
	}
	
	this.touchHandler = function(){//触屏事件处理器
		var _this = this;
		document.addEventListener("touchstart",function(ev){
			var ev = ev||window.event;
//			console.log(ev);
			var touchX = ev.changedTouches[0].clientX;
			var touchY = ev.changedTouches[0].clientY;
			console.log(touchX+":"+touchY);
			var head = _this.snakeBodyList[0];
			var headX = head.x*_this.step;//注意蛇头x坐标值与px的转换  乘以_this.step
			var headY = head.y*_this.step;//注意蛇头x坐标值与px的转换  乘以_this.step
			if(head.direct == "north" || head.direct == "south"){
				if(touchX < headX){
					head.direct = "west";
					head.img = westImg;
				}else{
					head.direct = "east";
					head.img = eastImg;
				}
			}else if(head.direct == "west" || head.direct == "east"){
				if(touchY < headY){
					head.direct = "north";
					head.img = northImg;
				}else{
					head.direct = "south";
					head.img = southImg;
				}
			}
			
		})
		
	}
	
	this.move = function() {
		
		if(!this.isPhone){
			this.keyHandler();
		}else{
			this.touchHandler();
		}	
		//3.1运用定时器，每隔0.2秒移动蛇（蛇的坐标变化，然后重绘）
		var _this = this;
		this.timer = setInterval(addMove,_this.time);
		console.log(_this.time);
	}
	
	
	function addMove(){
			//首先：解决蛇身跟随的问题
			for(var i = _this.snakeBodyList.length-1;i>0;i--){
				_this.snakeBodyList[i].x = _this.snakeBodyList[i-1].x;
				_this.snakeBodyList[i].y = _this.snakeBodyList[i-1].y;
			}
			//其次，根据方向及坐标，处理蛇头的移动新坐标
			var shead = _this.snakeBodyList[0];
			switch(shead.direct){
				case 'north':
					shead.y--;
				break;
				case 'south':
					shead.y++;
				break;
				case 'west':
					shead.x--;
				break;
				case 'east':
					shead.x++;
				break;
			}
		//3.1.1 判断，蛇移动后新位置是否已经触边界，或触自身  true--dead
		_this.dead();//判断蛇生死，isDead
		if(_this.isDead){
			//alert你的最终分数
//			$(".dead").slideDown(300);
//			$("#score-inner").text("Your score is:"+_this.score);
//			$("#X").click(function(){
//				$(".dead").slideUp(300);
//			})
//			alert("Your score is:"+_this.score);
			if(typeof(Storage)!=="underfined"){
				if(localStorage.score<_this.score){
					localStorage.getItem("score",_this.score);
				}
				
			}
			//重新开始游戏restart（）方法
			clearInterval(_this.timer);//如果不清除定时器，则速度会不断加快
			_this.isDead = false;//改变isDead状态，否则，每次直接死掉
			_this.snakeBodyList = [];//清除蛇身，便于重新开始游戏，重绘初始界面
//			_this.start();//游戏重新开始
			//$(_this.canvas).hide(2000);
		}else{
			
			//3.1.2 false：蛇活着，判断蛇头是否与食物的坐标点一致，如果一致，清空食物数组（多个食物时，可以使用标识位）
			_this.eat();//判断食物是否被吃，isEaten
			
			if(_this.isEaten){
//				console.log("*********eaten***********");
				_this.isEaten = false;
				//加分
				_this.score +=_this.foodList[0].score;
				//清空食物数组
				_this.foodList = [];
				
				//蛇身长一节
				var lastNodeIndex = _this.snakeBodyList.length;
				_this.snakeBodyList[lastNodeIndex] = {
					x:-2,
					y:-2,
					img:bodyImg,
					direct:_this.snakeBodyList[lastNodeIndex-1].direct
				};
			}
			//3.1.3 否则重绘
			_this.paint();//重绘游戏画面（背景+蛇+食物）
		}
	}
	
	
	
	
	
	/*
	 * 4-蛇死（碰到边界或碰到自身--dead 弹出得分界面）
	 */
	this.dead = function() {
		const LEFT_END = 0;//左边界
		const RIGHT_END = this.stepX;//右边界
		const NORTH_END = 0;//上边界
		const SOUTH_END = this.stepY;//下边界
		const headX = this.snakeBodyList[0].x;//蛇头横坐标x
		const headY = this.snakeBodyList[0].y;//蛇头纵坐标y
		//判断边界
		if(headX < LEFT_END-1 || headY < NORTH_END-1 || headX > RIGHT_END || headY > SOUTH_END){
			this.isDead = true;
			return;//精简判断过程
		}
		//判断是否撞到自身
		for(var k = this.snakeBodyList.length-1;k>0;k--){
			if(this.snakeBodyList[k].x == headX && this.snakeBodyList[k].y == headY){
				this.isDead = true;
			}			
		}
	}
	/*
	 * 5-蛇吃食物（蛇头坐标与食物坐标一致）
	 */
	this.eat = function(){
		const HEAD_X = this.snakeBodyList[0].x;//蛇头横坐标x
		const HEAD_Y = this.snakeBodyList[0].y;//蛇头纵坐标y
		const FOOD_X = this.foodList[0].x;//食物横坐标x
		const FOOD_Y = this.foodList[0].y;//食物纵坐标y
		if(HEAD_X == FOOD_X && HEAD_Y == FOOD_Y){
			this.isEaten = true;
		}
	}
}