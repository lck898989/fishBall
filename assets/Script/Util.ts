export default class Util {
    public static createRandom(minValue: number,maxValue: number): number {
        let res = Math.floor(Math.random() * (maxValue - minValue) + minValue);
        return res;
    }
}