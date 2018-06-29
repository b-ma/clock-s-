import { client, Experience } from 'soundworks-thing';
import Scheduler from '../../shared/Scheduler';
import TimeEngine from '../../shared/waves-audio/time-engine';
import fs from 'fs';
import path from 'path';
import { generateStepPattern, flattenPattern, numStepsValues } from './patterns';

const startTime = process.hrtime();

function getCurrentTime() {
  const time = process.hrtime(startTime);
  return time[0] + time[1] * 1e-9;
}

class Metro extends TimeEngine {
  constructor(sync, pd, patch, pattern, frequency) {
    super();

    this.sync = sync;
    this.pd = pd;
    this.patch = patch;
    this.pattern = pattern;
    this.index = 0;
    this.patternLength = this.pattern.length;
    this.period = 0.1;
  }

  advanceTime(syncTime) {
    const now = getCurrentTime();
    const localTime = this.sync.getLocalTime(syncTime);
    // const syncTime = this.sync.getSyncTime(audioTime);
    const dt = Math.ceil(localTime - now);

    // const audioTime = this.pd.currentTime;
    // console.log('pd:currentTime', audioTime);

    const gain = this.pattern[this.index];
    this.pd.send(this.patch.$0 + '-gain', gain);

    this.index = (this.index + 1) % this.patternLength;

    if (dt > 1) {
      setTimeout(() => {
        this.pd.send(this.patch.$0 + '-trigger');
      }, dt);
    } else {
      this.pd.send(this.patch.$0 + '-trigger');
    }

    return syncTime + this.period;
  }
}

class BeatsPerformance extends Experience {
  constructor(pd) {
    super();

    this.pd = pd;
    this.sync = this.require('sync', { getTime: getCurrentTime });
    this.checkin = this.require('checkin');
    this.sharedParams = this.require('shared-params');
  }

  start() {
    super.start();

    const baseFrequency = 200;
    const frequency = baseFrequency * (client.index + 1);

    const patchesPath = path.join(process.cwd(), 'pd');
    const patch = this.pd.openPatch('clocks.pd', patchesPath);
    this.pd.send(patch.$0 + '-frequency', frequency);

    const numSteps = numStepsValues[Math.floor(Math.random() * numStepsValues.length)];
    const pattern = generateStepPattern(numSteps);
    const flatPattern = flattenPattern(pattern);

    const scheduler = new Scheduler(this.sync.getSyncTime);
    const metro = new Metro(this.sync, this.pd, patch, flatPattern);

    this.sharedParams.addParamListener('start-stop', value => {
      console.log(value);
      if (value === 'start') {
        if (!metro.master) {
          const syncTime = this.sync.getSyncTime();
          scheduler.add(metro, Math.ceil(syncTime));
        }
      } else {
        if (metro.master)
          scheduler.remove(metro);
      }
    });
  }
}

export default BeatsPerformance;
