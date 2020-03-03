const {ccclass, property} = cc._decorator;
// 发射小球的类
@ccclass
export default class LaunchBall extends cc.Component {
    @property({type: cc.Label})
    numberLabel: cc.Label = null;
    start () {

    }
    setNumberString(num: number): void {
        this.numberLabel.string = num.toString();
    }
    getNumberString(): number {
        return Number(this.numberLabel.string);
    }
    startMove(): void {
        let ballNode: cc.Node = this.node.getChildByName("red");
        cc.tween(ballNode).to(1,{
            opacity: 150
        }).start();
    }
    startBack(): void {
        let ballNode: cc.Node = this.node.getChildByName("red");
        cc.tween(ballNode).to(1,{
            opacity: 0
        }).start();
    }
    update (dt) {

    }
}
