from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import tensorflow as tf
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from keras.losses import MeanSquaredError
import feedparser
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import threading
import time
from flask_socketio import SocketIO, emit, join_room, leave_room
import openai
from dotenv import load_dotenv
import google.generativeai as genai
from dotenv import load_dotenv
import os


# Initialize Flask app
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# OpenAI API Configuration
openai.api_key = "sk-1234uvwx5678abcd1234uvwx5678abcd1234uvwx"  # Replace with your actual API key

# Track active subscriptions
active_subscriptions = set()

# Constants
YAHOO_FINANCE_URL = "https://query1.finance.yahoo.com/v7/finance/quote"
SYMBOLS = [
    {'symbol': '^NSEI', 'name': 'NIFTY 50'},
    {'symbol': '^BSESN', 'name': 'SENSEX'},
    {'symbol': 'RELIANCE.NS', 'name': 'RELIANCE'},
    {'symbol': 'TCS.NS', 'name': 'TCS'},
    {'symbol': 'INFY.NS', 'name': 'INFOSYS'},
    {'symbol': 'HDFCBANK.NS', 'name': 'HDFC BANK'}
]

# Initialize NLP
nltk.download('vader_lexicon')
analyzer = SentimentIntensityAnalyzer()

# Load ML Model
custom_objects = {"mse": MeanSquaredError()}
model = tf.keras.models.load_model("originalModel.h5", custom_objects=custom_objects)

# Helper Functions
def fetch_stock_data(symbol, period="1y"):
    """Fetch stock data from Yahoo Finance"""
    symbol = symbol.replace("NSE:", "") + ".NS" if not symbol.endswith(".NS") else symbol
    
    today = datetime.today().strftime('%Y-%m-%d')
    start_date = (datetime.today() - timedelta(days=365)).strftime('%Y-%m-%d') if period == "1y" else \
                 (datetime.today() - timedelta(days=30)).strftime('%Y-%m-%d') if period == "1mo" else \
                 (datetime.today() - timedelta(days=1)).strftime('%Y-%m-%d')
    
    try:
        interval = "1m" if period == "1d" else "1d"
        df = yf.download(symbol, start=start_date, end=today, interval=interval)
        return df if not df.empty else None
    except Exception as e:
        print(f"Error fetching stock data: {e}")
        return None

def fetch_detailed_stock_data(symbol):
    """Fetch comprehensive stock data from Yahoo Finance"""
    try:
        stock = yf.Ticker(symbol)
        hist = stock.history(period="1y")
        info = stock.info
        
        # Calculate year range
        year_high = hist['High'].max()
        year_low = hist['Low'].min()
        
        # Get latest day data
        day_data = stock.history(period="1d")
        
        return {
            'symbol': symbol,
            'current_price': round(day_data['Close'].iloc[-1], 2),
            'previous_close': round(info.get('previousClose', 0), 2),
            'day_range': {
                'low': round(day_data['Low'].iloc[-1], 2),
                'high': round(day_data['High'].iloc[-1], 2)
            },
            'year_range': {
                'low': round(year_low, 2),
                'high': round(year_high, 2)
            },
            'market_cap': f"{round(info.get('marketCap', 0)/1e12, 2)}T INR",
            'avg_volume': f"{round(info.get('averageVolume', 0)/1e6, 2)}M",
            'pe_ratio': round(info.get('trailingPE', 0), 2),
            'dividend_yield': round(info.get('dividendYield', 0)*100, 2),
            'exchange': info.get('exchange', 'NSE'),
            'about': info.get('longBusinessSummary', ''),
            'ceo': info.get('companyOfficers', [{}])[0].get('name', ''),
            'founded': info.get('foundedYear', ''),
            'website': info.get('website', ''),
            'employees': info.get('fullTimeEmployees', 0),
            'last_updated': datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error fetching data for {symbol}: {e}")
        return None

def fetch_sentiment(stock_name):
    """Fetch news sentiment for a stock"""
    rss_url = f"https://news.google.com/rss/search?q={stock_name}"
    news_feed = feedparser.parse(rss_url)
    sentiment_scores = []
    
    if not news_feed.entries:
        return 0

    for entry in news_feed.entries[:5]:
        sentiment_score = analyzer.polarity_scores(entry.title)['compound']
        sentiment_scores.append(sentiment_score)

    return sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0

def add_technical_indicators(df, sentiment_score=0):
    """Add technical indicators to stock data"""
    df['SMA'] = df['Close'].rolling(window=50).mean()
    df['EMA'] = df['Close'].ewm(span=50, adjust=False).mean()
    df['MACD'] = df['Close'].ewm(span=12, adjust=False).mean() - df['Close'].ewm(span=26, adjust=False).mean()
    df['RSI'] = 100 - (100 / (1 + df['Close'].pct_change().rolling(14).mean()))
    df['ADX'] = (df['High'] - df['Low']).rolling(window=14).mean()
    df['WMA'] = df['Close'].rolling(window=20).apply(lambda x: np.average(x, weights=np.arange(1, 21)))
    df['STOCH'] = 100 * (df['Close'] - df['Low'].rolling(14).min()) / (df['High'].rolling(14).max() - df['Low'].rolling(14).min())
    df['Sentiment_Score'] = sentiment_score
    df.dropna(inplace=True)
    return df

def prepare_data(df):
    """Prepare data for model prediction"""
    feature_cols = ['Open', 'High', 'Low', 'Close', 'SMA', 'EMA', 'MACD', 
                   'RSI', 'ADX', 'WMA', 'STOCH', 'Sentiment_Score']
    
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(df[feature_cols])
    X = [scaled_data[i-30:i] for i in range(30, len(scaled_data) - 1)]
    return np.array(X), scaler

def background_data_updater():
    """Background thread for real-time updates"""
    while True:
        for symbol in list(active_subscriptions):
            data = fetch_detailed_stock_data(symbol)
            if data:
                socketio.emit('stock_update', data, room=symbol)
        time.sleep(15)  # Update every 15 seconds

# Start background threads
threading.Thread(target=background_data_updater, daemon=True).start()

# Fixed Real-time price updater for specific stocks
def realtime_price_updater():
    """Continuously fetch and emit real-time prices"""
    while True:
        for symbol in ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS']:
            try:
                stock = yf.Ticker(symbol)
                
                # Try to get intraday data first (only works during market hours)
                hist = stock.history(period="1d", interval="1m")
                
                if not hist.empty:
                    latest_price = hist['Close'].iloc[-1]
                    socketio.emit("stock_price_update", {
                        "symbol": symbol, 
                        "price": latest_price,
                        "timestamp": datetime.now().isoformat()
                    })
                else:
                    # Fallback to regular market data if intraday not available
                    data = stock.history(period="1d")
                    if not data.empty:
                        latest_price = data['Close'].iloc[-1]
                        socketio.emit("stock_price_update", {
                            "symbol": symbol, 
                            "price": latest_price,
                            "timestamp": datetime.now().isoformat(),
                            "note": "delayed data"
                        })
                    
            except Exception as e:
                print(f"Error fetching price for {symbol}: {str(e)}")
                # Implement retry with exponential backoff or other error handling
                
        time.sleep(30)  # Reduced update frequency to avoid rate limiting

threading.Thread(target=realtime_price_updater, daemon=True).start()

# SocketIO Handlers
@socketio.on('subscribe')
def handle_subscribe(symbol):
    """Handle new subscriptions"""
    active_subscriptions.add(symbol)
    join_room(symbol)
    # Send initial data
    data = fetch_detailed_stock_data(symbol)
    if data:
        emit('stock_update', data)

@socketio.on('unsubscribe')
def handle_unsubscribe(symbol):
    """Handle unsubscriptions"""
    if symbol in active_subscriptions:
        active_subscriptions.remove(symbol)
    leave_room(symbol)

# API Endpoints
@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    """Get current market data for multiple stocks"""
    try:
        symbols = request.args.get('symbols', '').split(',') or [s['symbol'] for s in SYMBOLS]
        
        params = {
            'symbols': ','.join(symbols),
            'fields': 'symbol,regularMarketPrice,regularMarketChangePercent,shortName'
        }
        
        response = requests.get(YAHOO_FINANCE_URL, params=params)
        response.raise_for_status()
        
        data = response.json().get('quoteResponse', {}).get('result', [])
        
        formatted_data = []
        for stock in data:
            try:
                symbol = stock['symbol']
                name = next((s['name'] for s in SYMBOLS if s['symbol'] == symbol), symbol)
                price = stock.get('regularMarketPrice', 0)
                
                if symbol in ['^NSEI', '^BSESN']:
                    price = price / 100  # Correct Yahoo's 100x multiplier
                
                change = stock.get('regularMarketChangePercent', 0)
                
                formatted_data.append({
                    'symbol': name,
                    'price': round(price, 2),
                    'change': round(change, 2),
                    'isGainer': change >= 0,
                    'updated': datetime.utcnow().isoformat()
                })
            except KeyError as e:
                print(f"Missing key in stock data: {e}")
                continue

        return jsonify(formatted_data)
        
    except Exception as e:
        print(f"Error fetching stock data: {str(e)}")
        fallback = [
            {'symbol': 'NIFTY 50', 'price': 24442.50, 'change': 0.3, 
             'isGainer': True, 'updated': datetime.utcnow().isoformat()},
            {'symbol': 'SENSEX', 'price': 80749.30, 'change': 0.28, 
             'isGainer': True, 'updated': datetime.utcnow().isoformat()}
        ]
        return jsonify(fallback), 200

@app.route('/live-data', methods=['POST'])
def get_live_data():
    """Get intraday market data"""
    data = request.json
    stock_symbol = data.get("stock_symbol")

    if not stock_symbol:
        return jsonify({"error": "Stock symbol is required"}), 400

    try:
        df = fetch_stock_data(stock_symbol, period="1d")
        if df is None or df.empty:
            return jsonify({"error": "No data found"}), 404

        latest = df.iloc[-1]
        return jsonify({
            "stock_symbol": stock_symbol,
            "Open": round(latest["Open"], 2),
            "High": round(latest["High"], 2),
            "Low": round(latest["Low"], 2),
            "Close": round(latest["Close"], 2),
            "Volume": int(latest["Volume"])
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/stock-price", methods=["POST"])
def get_stock_price():
    """Get historical stock prices"""
    data = request.json
    stock_symbol = data.get("stock_symbol")
    period = data.get("period", "1mo")  # Default to 1 month
    
    try:
        df = fetch_stock_data(stock_symbol, period)
        if df is None:
            return jsonify({"error": "Could not fetch stock data"}), 500

        # Resample data for better chart performance
        if period == "1y":
            df = df.resample('W').last()
        elif period == "1mo":
            df = df.resample('D').last()
        
        stock_data = [
            {"date": str(index.date()), "price": row["Close"]}
            for index, row in df.iterrows()
        ]
        return jsonify({"stock_symbol": stock_symbol, "prices": stock_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict", methods=["POST"])
def predict_stock():
    """Predict future stock prices"""
    try:
        data = request.json
        stock_symbol = data.get("stock_symbol")
        
        if not stock_symbol:
            return jsonify({"error": "Stock symbol is required"}), 400

        df = fetch_stock_data(stock_symbol)
        if df is None or df.empty or len(df) < 50:
            return jsonify({"error": f"Not enough data for {stock_symbol}"}), 400

        sentiment_score = fetch_sentiment(stock_symbol.split('.')[0])
        df = add_technical_indicators(df, sentiment_score)
        X, scaler = prepare_data(df)

        if len(X) == 0:
            return jsonify({"error": "Insufficient processed data"}), 400

        X_last_30_days = X[-1].reshape(1, 30, 12)
        prediction = model.predict(X_last_30_days)
        prediction = scaler.inverse_transform(np.concatenate([prediction, np.zeros((1, 8))], axis=1))[:, :4]

        return jsonify({
            "stock_symbol": stock_symbol,
            "Open": round(prediction[0][0], 2),
            "High": round(prediction[0][1], 2),
            "Low": round(prediction[0][2], 2),
            "Close": round(prediction[0][3], 2),
            "sentiment_score": round(sentiment_score, 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# In your Flask backend, ensure complete data is returned
@app.route('/stock/<symbol>', methods=['GET'])
def get_stock_intraday_data(symbol):
    try:
        stock = yf.Ticker(symbol)
        hist = stock.history(period="1d", interval="1m")
        if hist.empty:
            hist = stock.history(period="5d", interval="1h")  # Fallback
            
        return jsonify({
            "symbol": symbol,
            "prices": hist['Close'].to_dict(),
            "volume": hist['Volume'].to_dict(),
            "current_price": hist['Close'].iloc[-1] if not hist.empty else None
        })
    
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    



load_dotenv()  # Load .env

# Configure Gemini (add to your existing imports)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def query_gemini(prompt, stock_data=None):
    """Query Gemini 1.5 Pro with optional stock context."""
    model = genai.GenerativeModel('gemini-1.5-pro-latest')
    
    # Enhance prompt with stock data if available
    if stock_data:
        prompt = f"""
        User Question: {prompt}
        Stock Context: {stock_data}
        Respond as a financial analyst with 10+ years of experience.
        """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

# Update your chatbot route
@app.route("/chatbot", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()

    # Handle stock queries
    if "stock" in user_message.lower():
        ticker = extract_ticker(user_message)
        if ticker:
            stock_data = fetch_detailed_stock_data(ticker)
            if stock_data:
                reply = query_gemini(user_message, stock_data)
                return jsonify({"reply": reply})

    # General chat
    reply = query_gemini(user_message)
    return jsonify({"reply": reply})    


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)