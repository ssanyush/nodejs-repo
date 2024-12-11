const http = require('http');
const url = require('url');
//const qs = require('querystring');
const MongoClient = require('mongodb').MongoClient;
//const fs = require('fs');

const connectionString = "mongodb+srv://shayna:shayna@cluster0.5bupr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

client =new MongoClient(connectionString);
var port = process.env.PORT || 3000; 

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    urlObj = url.parse(req.url, true);
    path = urlObj.pathname;
    if (path == "/") {
        const home = `
        <html>
        <body>
          <h1>Search for Stocks by Name or Symbol</h1>
          <form action='/process' method='get'>
            <label for="searchInput">Enter Company Name or Stock Ticker:</label>
            <input type="text" name="searchInput" required><br>
            
            <input type="radio" id="companyName" name="buttonans" value="company" required>
            <label for="companyName">Company Name</label><br>
            
            <input type="radio" id="tickerSymbol" name="buttonans" value="ticker" required>
            <label for="tickerSymbol">Ticker Symbol</label><br>
            
            <input type="submit" value="Search">
          </form>
        </body>
        </html>
      `;
      res.write(home);
    }

    else if (path == "/process") {

        const data = urlObj.query;
        const searchInput = data.searchInput.trim(); 
        const buttonans = data.buttonans;

        async function processSearch() {
          try {
            await client.connect();

            const db = client.db("Stock");
            const collection = db.collection("PublicCompanies");
    
            let query = {};
            
            if (buttonans === 'company') {
              query = { company: searchInput };
            } 
            else if (buttonans === 'ticker') {
              query = { ticker: searchInput };
            }
    
            const companies = await collection.find(query).toArray();
            var htmlpage = `<html><body>
                  <h1>Results</h1><br>`;
    
            if (companies.length === 0) {
              res.write("<p>None found</p>");
            } 
            else {
              res.write("<p>Search Results:</p>");
              companies.forEach(company => {
                res.write(`<p>Name of Company: ${company.company}, Ticker: ${company.ticker}, Price: $${company.price}</p>`);
                htmlpage += `<p>Name of Company: ${company.company}, Ticker: ${company.ticker}, Price: $${company.price}</p><br>`;
              });
            }
           htmlpage += `</body></html>`;
           res.end(htmlpage);
          } 
          catch (err) {
            console.log("Error: " + err);
          } 
          finally {
            //await client.close();
          }
        }
        processSearch();
      }
    }).listen(port);
