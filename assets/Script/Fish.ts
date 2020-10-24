import Util from "./Util";

const {ccclass, property} = cc._decorator;
/**
 * 
 * 鱼类 运动的简单相关实现
 * 
 */
@ccclass
export default class Fish extends cc.Component {
    // 方向
    private direction: number = 0;
    // 速度圆半径
    private moveSpeed: number = -50;
    // 是否是前进方向
    private isFoward: boolean = false;

    private canMove: boolean = true;

    private curSpeed: cc.Vec2 = new cc.Vec2(0,0);

    start () {
        // 生成随机的方向 变换scaleX,rotation
        this.direction = Util.createRandom(0,360);
        this.node.angle = this.direction;
        if(this.node.angle > 90 && this.node.angle < 270) {
            this.node.scaleY = -0.5;
        }
    }

    private move(dt: number): void {
        let speedX = this.moveSpeed * Math.cos(this.direction * Math.PI / 180);
        let speedY = this.moveSpeed * Math.sin(this.direction * Math.PI / 180);
        this.curSpeed.x = speedX;
        this.curSpeed.y = speedY;
        this.node.x += dt * speedX;
        this.node.y += dt * speedY;
    }

    private async change(border: string) {
        this.canMove = false;
        let self = this;
        switch(border) {
            case 'l':
                // 左边界角度变化为 90-270
                this.direction = Util.createRandom(90,270);
                if(this.node.scaleY * 10 === 5) {
                    // 变换
                    cc.tween(this.node).to(0.3,{
                        scaleY: -0.5
                    }).call(() => {

                    }).start();
                }
                // this.node.scaleY = -0.5;
                break;
            case 'r':
                this.direction = Util.createRandom(-90,90);
                if(this.node.scaleY * 10 === -5) {
                    cc.tween(this.node).to(0.3,{
                        scaleY: 0.5
                    }).call(() => {

                    }).start();
                }
                break;
            case 'u':
                this.direction = Util.createRandom(0,180);
                if(this.direction > 90) {
                    cc.tween(this.node).to(0.3,{
                        scaleY: -0.5
                    }).call(() => {

                    }).start();
                } else {
                    cc.tween(this.node).to(0.3,{
                        scaleY: 0.5
                    }).call(() => {

                    }).start();
                }
                break;
            case 'd':
                this.direction = Util.createRandom(180,360);
                if(this.direction >= 180 && this.direction < 270) {
                    cc.tween(this.node).to(0.3,{
                        scaleY: -0.5
                    }).call(() => {

                    }).start();
                } else {
                    cc.tween(this.node).to(0.3,{
                        scaleY: 0.5
                    }).call(() => {

                    }).start();
                }
                break;            
        }
        // this.node.angle = this.direction;
        new Promise((resolve,reject) => {
            cc.tween(this.node).to(0.3,{
                angle: self.direction
            }).call(() => {
                resolve();
            }).start();
        })
        this.canMove = true;
    }
    
    update (dt: number) {
        if(this.node.scaleX === 0.5) {
            this.isFoward = true;
        } else {
            this.isFoward = false;
        }
        if(this.node.x >= 360) {
            // 变换速度方向 变换scaleX
            this.change('r');
        } else if(this.node.x <= -370) {
            // 变换方向 变换scaleX
            this.change('l');
        } else if(this.node.y <= -300) {
            // 变换方向 变换scaleX
            this.change('d');
        } else if(this.node.y >= 280) {
            // 变换方向 变换scaleX
            this.change('u');
        }
        if(this.canMove) {
            this.move(dt);
        }
        
    }
}
