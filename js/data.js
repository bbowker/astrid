class Data {
	constructor (data) {
		this.data = _.map(data, function (datum) {
			let cleansed = {};
			_.each(datum, function (value, key) {
				// Add dates and remove leading spaces from keys
				cleansed[key.trim()] = (value && /date|time/i.test(key)) ? new Date(value) : value;
			});
			return cleansed;
		});
	}
}

class Excretions extends Data {
}

class Feeds extends Data {
}

class Sleeps extends Data {
	constructor (data, dayNightHour) {
		super(data.reverse());
		this.dayNightHour = dayNightHour || 8; // daytime 8 am - 8 pm
		console.assert(this.dayNightHour < 12, 'dayNightHour must be between 0 and 11');
		_.each(this.data, function (sleep) {
			sleep["Approximate Duration (Minutes)"] = parseInt(sleep["Approximate Duration (Minutes)"]);
			sleep["Start Time"] = sleep["Start Time"] && new Date(sleep["Start Time"]);
			sleep["End Time"] = sleep["End Time"] && new Date(sleep["End Time"]);
			if (sleep["Start Time"] && !sleep["End Time"]) {
				sleep["End Time"] = new Date(sleep["Start Time"].getTime() + sleep["Approximate Duration (Minutes)"] * 60 * 1000);
			}

			sleep["Mid Time"] = new Date((sleep["Start Time"].getTime() + sleep["End Time"].getTime()) / 2);
			sleep["Nap"] = sleep["Mid Time"].getHours() >= this.dayNightHour && sleep["Mid Time"].getHours() < this.dayNightHour + 12;

			var dayAdjustment = (sleep["Mid Time"].getHours() < this.dayNightHour) ? -1 : 0;
			sleep["Day"] = new Date(sleep["Mid Time"].getFullYear(), sleep["Mid Time"].getMonth(), sleep["Mid Time"].getDate() + dayAdjustment);
		}, this);
	}

	get naps() {
		return _.where(this.data, {"Nap": true}, this);
	}

	get nightSleeps() {
		return _.where(this.data, {"Nap": false}, this);
	}

	get sleepsByDay() {
		return _.groupBy(this.data, "Day", this);
	}
}

