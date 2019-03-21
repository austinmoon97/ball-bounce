//canvas initialize
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//balls on screen
var balls = [];

var colors = ["#304269", "#0071BC", "#91BED4", "#6B6B6B", "#F26101"];

//onload function
function start(){

    balls.push(new Ball());     //start with 1 ball

    setInterval(update,10);

}

var Ball = function(){

    this.r = Math.floor(Math.random() * 20) + 10;
    this.x = Math.floor(Math.random() * (canvas.width - (2*this.r)) ) + this.r;
    this.y = Math.floor(Math.random() * (canvas.height - (2*this.r)) ) + this.r;
    this.xvel = ((Math.random() * 3) + 2) * Math.pow(-1, Math.floor(Math.random() * 2));
    this.yvel = ((Math.random() * 3) + 2) * Math.pow(-1, Math.floor(Math.random() * 2));
    //this.color = '#' + Math.floor((Math.random() * 0xFFFFFF)).toString(16);
    this.color = colors[Math.floor(Math.random() * 5)];
    this.mass = Math.pow(this.r, 2) * Math.PI;

    //array of balls that 'this' ball has recently collided with
    //used to prevent calculations between these balls before they have completely separated
    this.collidingWith = [];

    //updates next location to draw ball
    this.move = function(){
        this.checkWallCollide();
        this.x += this.xvel;
        this.y += this.yvel;
    }

    //draws a ball
    this.draw = function(){
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    //check if 'this' ball is hitting a wall
    this.checkWallCollide = function(){
        if((this.x - this.r) <= 0 || (this.x + this.r) >= canvas.width){
            this.xvel *= -1;
        }
        if((this.y - this.r) <= 0 || (this.y + this.r) >= canvas.height){
            this.yvel *= -1;
        }
    }

    //check to see if 'this' ball is colliding with argument ball
    this.checkBallCollide = function(ball){
        //squared distance and radius to simplify code
        //distance between ball centers

        var distBetween = Math.pow(this.x - ball.x,2) + Math.pow(this.y - ball.y,2);
        var radiiSum = Math.pow(this.r + ball.r,2);

        return distBetween < radiiSum;
    }

    // velocity changes due to elastic collision
    // v1final = ((m1-m2)v1 + 2m2*v2)/(m1+m2)
    // v2final = ((m2-m1)v2 + 2m1*v1)/(m1+m2)
    this.ballCollision = function(ball2){

        //implementation of elastic ball collisions using the formulas above
        var ball1newxvel = (((this.mass - ball2.mass) * this.xvel) + (2 * ball2.mass * ball2.xvel)) / (this.mass + ball2.mass);
        var ball1newyvel = (((this.mass - ball2.mass) * this.yvel) + (2 * ball2.mass * ball2.yvel)) / (this.mass + ball2.mass);
        var ball2newxvel = (((ball2.mass - this.mass) * ball2.xvel) + (2 * this.mass * this.xvel)) / (this.mass + ball2.mass);
        var ball2newyvel = (((ball2.mass - this.mass) * ball2.yvel) + (2 * this.mass * this.yvel)) / (this.mass + ball2.mass);

        this.xvel = ball1newxvel;
        this.yvel = ball1newyvel;
        ball2.xvel = ball2newxvel;
        ball2.yvel = ball2newyvel;

        //add to ball's list of recently collided balls
        //used to prevent collision calculations until these balls are completely separated
        this.collidingWith.push(ball2);    
    }
}

window.addEventListener('click',
    function() {
        clickSpawn();
    })

window.addEventListener('resize',
    function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    })

//spawns a new ball on mouse click at a random location on canvas
function clickSpawn(){
    balls.push(new Ball());
}

//looping function to draw balls and detect for collisions
function update(){
    //clears the canvas before the next draw
    ctx.clearRect(0,0,canvas.width,canvas.height)

    var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#0F2033");
    gradient.addColorStop(.5, "#1A3757");
    gradient.addColorStop(1, "#0F2033");

    //ctx.fillStyle = "#383838";  //gray bkgd
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    //check if any balls are colliding
    for(var i = 0; i < balls.length; i++){
        for(var j = i + 1; j < balls.length; j++){

            //check to see 2 balls have recently collided
            if(balls[i].collidingWith.indexOf(balls[j]) != -1){

                //if the 2 balls are still colliding, skip to next iteration of loop
                //we want the balls to be separated before another calculation
                if(balls[i].checkBallCollide(balls[j])) {
                    continue;
                }
                //if balls are no longer colliding, remove from collidingwith array
                else{
                    balls[i].collidingWith.splice(balls[i].collidingWith.indexOf(balls[j]), 1);
                }

            }

            if(balls[i].checkBallCollide(balls[j])){        //if collision, adjust velocities
                balls[i].ballCollision(balls[j]);
            }

        }

        //update location of each ball and draw it
        balls[i].move();
        balls[i].draw();
    }
    

}


