import { Experience } from 'soundworks/server';


class BeatsExperience extends Experience {
  constructor(clientTypes) {
    super(clientTypes);

    this.sync = this.require('sync');
    this.syncScheduler = this.require('sync-scheduler');
    this.sharedParams = this.require('shared-params');
    this.checkin = this.require('checkin');
  }

  start() {
    this.startTime = this.sync.getSyncTime();
    this.beatPeriod = 1; // in seconds
  }

  enter(client) {
    super.enter(client);

    this.send(client, 'start:beat', this.startTime, this.beatPeriod);
  }
}

export default BeatsExperience;
