-- Add sentiment analysis columns to daily_logs
ALTER TABLE daily_logs 
ADD COLUMN IF NOT EXISTS sentiment_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS sentiment_label TEXT,
ADD COLUMN IF NOT EXISTS emotional_patterns JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_insights TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_logs_sentiment ON daily_logs(sentiment_label);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, log_date DESC);