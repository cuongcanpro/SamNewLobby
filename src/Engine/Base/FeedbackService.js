var fr = fr || {};

/**
 * The Feedback Service
 * @version 1.0
 */
fr.feedbackService = {
	/**
	 * Initialize the feedback service
	 * Initializing Order:
	 * 	1) PlatformWrapper
	 *  2) ZPTracker
	 *  3) FeedbackService
	 */
	init: function() {},

	/**
	 * Set current account after loging in.
	 * @param {Number} accountId ID of User
	 * @param {String} accountName Account Name of User
	 */
	setAccountInfo: function(accountId, accountName) {
		cc.log("USER DATA:", accountId, accountName);
		this._accountId = accountId;
		this._accountName = accountName;
	},

	/**
	 * Send a feedback
	 * @param {String}feedback Feedback string
	 */
	sendFeedback: function(feedback) {
		try {
			if (this._accountId === undefined
				|| this._accountName === undefined
				|| !feedback
			) {
				return;
			}

			fr.tracker.sendLogBulk(JSON.stringify({
				ActionType: "FEEDBACK",
				ActionData: {
					AccountID: this._accountId,
					AccountName: this._accountName,
					Message: feedback + ""
				}
			}));
		} catch (err) {}
	}
};
