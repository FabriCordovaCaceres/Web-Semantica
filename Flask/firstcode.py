from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "<p>Hello world Whaaa</p>"

if __name__ == '__main__':
    app.run(debug=True)