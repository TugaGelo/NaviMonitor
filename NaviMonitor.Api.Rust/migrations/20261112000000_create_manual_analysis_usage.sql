-- How many Gemini manual analyses each user ran per day (UTC), for the daily limit.
CREATE TABLE manual_analysis_usage (
    user_id TEXT NOT NULL,
    day DATE NOT NULL,
    count INT NOT NULL,
    PRIMARY KEY (user_id, day)
);
