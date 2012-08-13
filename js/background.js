var Player = {
	counter: 0,
	intervalId: 0,
	start: function(){
		this.intervalId = setInterval(this.animate, 150);
	},
	stop: function(){
		clearInterval(this.intervalId);
		chrome.browserAction.setBadgeText({text:''});
	},
	animate: function(){
		var animation = ["....:",":..::","..::.",":.:.:","::.:.",":.:..",".:.:.",":.:.:","::.:.","..:::","..:..",":..:.","..:.:","...::",":.::.",".::::","..::.",":.::.",":..:.",".:::."];
		if(this.counter < 19){
			this.counter += 1;
		}
		else{
			this.counter = 0;
		}
		chrome.browserAction.setBadgeText({text:animation[this.counter]});
	}
}
