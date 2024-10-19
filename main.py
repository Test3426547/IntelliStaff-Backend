from flask import Flask, request, jsonify
from linkedin_scraper import scrape_linkedin_job

app = Flask(__name__)

@app.route('/scrape', methods=['POST'])
def scrape():
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({"error": "No URL provided"}), 400
    
    content = scrape_linkedin_job(url)
    return jsonify({"content": content})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
