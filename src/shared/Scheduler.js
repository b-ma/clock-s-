import SchedulingQueue from './waves-audio/scheduling-queue';

class Scheduler extends SchedulingQueue {
  constructor(getTimeFunction, options = {}) {
    super();

    this.getTimeFunction = getTimeFunction;

    this.__currentTime = null;
    this.__nextTime = Infinity;
    this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     */
    this.period = options.period ||  0.025;

    this.lookahead = options.lookahead ||  0.025;


    this.__tick = this.__tick.bind(this);
  }

  // setTimeout scheduling loop
  __tick() {
    const currentTime = this.getTimeFunction();
    let time = this.__nextTime;

    this.__timeout = null;

    while (time <= currentTime + this.lookahead) {
      this.__currentTime = time;
      time = this.advanceTime(time);
    }

    this.__currentTime = null;
    this.resetTime(time);
  }

  resetTime(time = this.currentTime) {
    if (this.__timeout) {
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }

    if (time !== Infinity) {
      const timeOutDelay = Math.max((time - this.lookahead - this.getTimeFunction()), this.period);

      this.__timeout = setTimeout(this.__tick, Math.ceil(timeOutDelay * 1000));
    }

    this.__nextTime = time;
  }

  get currentTime() {
    return this.__currentTime || this.getTimeFunction();
  }
}

export default Scheduler;
