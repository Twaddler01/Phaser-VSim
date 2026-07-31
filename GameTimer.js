export default class GameTimer {

    constructor(gameData) {
        this.gameData = gameData;
    }

    update(delta) {
        this.gameData.elapsedTime += delta;
    }

    getTimestamp() {
        const totalSeconds = Math.floor(
            this.gameData.elapsedTime / 1000
        );

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }
}